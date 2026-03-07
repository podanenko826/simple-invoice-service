import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type TableProps = Omit<cdk.aws_dynamodb.TableProps, "partitionKey" | "sortKey">;

export class Passwordless extends Construct {
    userPool: cdk.aws_cognito.UserPool;
    userPoolClient: cdk.aws_cognito.UserPoolClient;
    secretsTable: cdk.aws_dynamodb.Table;
    createAuthChallengeFn: cdk.aws_lambda.IFunction;
    verifyAuthChallengeResponseFn: cdk.aws_lambda.IFunction;
    defineAuthChallengeResponseFn: cdk.aws_lambda.IFunction;
    preSignUpFn?: cdk.aws_lambda.IFunction;
    preTokenGenerationFn?: cdk.aws_lambda.IFunction;
    kmsKey: cdk.aws_kms.IKey;
    constructor(
        scope: Construct,
        id: string,
        props: {
            /** Project name prefix for resource naming */
            projectNamePrefix: string;
            /** Environment name (dev/prod) */
            environment: string;
            /** If you don't provide an existing User Pool, one will be created for you. Pass any properties you want for it, these will be merged with properties from this solution */
            userPoolProps?: Partial<cdk.aws_cognito.UserPoolProps>;
            /**
             * The origins where you will be hosting your Web app on: scheme, hostname, and optionally port.
             * Do not include path as it will be ignored. The wildcard (*) is not supported.
             *
             * Example value: https://subdomain.example.org
             *
             * This property is required for Magic Links:
             * - It is validated that the redirectUri (without path) in each Magic Link matches one of the allowedOrigins.
             */
            allowedOrigins: string[];
            /**
             * Magic Link authentication configuration
             */
            magicLink: {
                /** The e-mail address you want to use as the FROM address of the magic link e-mails */
                emailFromAddress: string;
                kmsKeyProps?: cdk.aws_kms.KeyProps;
                secretsTableProps?: TableProps;
                secondsUntilExpiry?: cdk.Duration;
                minimumSecondsBetween?: cdk.Duration;
                autoConfirmUsers?: boolean;
            };
            /** Pass any properties you want for the AWS Lambda functions created, these will be merged with properties from this solution */
            functionProps?: {
                createAuthChallenge?: Partial<cdk.aws_lambda_nodejs.NodejsFunctionProps>;
                defineAuthChallenge?: Partial<cdk.aws_lambda_nodejs.NodejsFunctionProps>;
                verifyAuthChallengeResponse?: Partial<cdk.aws_lambda_nodejs.NodejsFunctionProps>;
                preSignUp?: Partial<cdk.aws_lambda_nodejs.NodejsFunctionProps>;
                preTokenGeneration?: Partial<cdk.aws_lambda_nodejs.NodejsFunctionProps>;
            };
            /** Any keys in the clientMetadata that you specify here, will be persisted as claims in the ID-token, via the Amazon Cognito PreToken-generation trigger */
            clientMetadataTokenKeys?: string[];
            /**
             * Specify to enable logging in all lambda functions.
             * Note that log level DEBUG will log sensitive data, only use while developing!
             *
             * @default "INFO"
             */
            logLevel?: "DEBUG" | "INFO" | "ERROR";
        }
    ) {
        super(scope, id);

        // Create SSM Parameter for SendGrid API key with placeholder
        // Update the parameter value manually in AWS Console after deployment
        const sendgridApiKeyParameter = new cdk.aws_ssm.StringParameter(
            this,
            `SendGridApiKeyParameter${id}`,
            {
                parameterName: `/${props.projectNamePrefix}/sendgrid-api-key`,
                description: `[${props.environment}] SendGrid API key for magic link emails - UPDATE THIS VALUE`,
                stringValue: "PLACEHOLDER_UPDATE_IN_AWS_CONSOLE",
                tier: cdk.aws_ssm.ParameterTier.STANDARD,
            }
        );

        // Create KMS key for signing magic links
        const key = new cdk.aws_kms.Key(this, `KmsKeyRsa${id}`, {
            ...props.magicLink.kmsKeyProps,
            keySpec: cdk.aws_kms.KeySpec.RSA_2048,
            keyUsage: cdk.aws_kms.KeyUsage.SIGN_VERIFY,
            policy: new cdk.aws_iam.PolicyDocument({
                statements: [
                    new cdk.aws_iam.PolicyStatement({
                        effect: cdk.aws_iam.Effect.ALLOW,
                        notActions: ["kms:Sign"],
                        resources: ["*"],
                        principals: [new cdk.aws_iam.AccountRootPrincipal()],
                    }),
                ],
            }),
        });
        this.kmsKey = key.addAlias(`${props.projectNamePrefix}-magic-link-key`);

        // Create DynamoDB table for storing magic link secrets
        this.secretsTable = new cdk.aws_dynamodb.Table(
            scope,
            `SecretsTable${id}`,
            {
                tableName: `${props.projectNamePrefix}-auth-secrets`,
                billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
                ...props.magicLink.secretsTableProps,
                partitionKey: {
                    name: "userNameHash",
                    type: cdk.aws_dynamodb.AttributeType.BINARY,
                },
                timeToLiveAttribute: "exp",
            }
        );

        // Create pre-signup Lambda to auto-confirm users
        const autoConfirmUsers = props.magicLink.autoConfirmUsers ?? true;
        if (autoConfirmUsers) {
            this.preSignUpFn = new cdk.aws_lambda_nodejs.NodejsFunction(
                this,
                `PreSignup${id}`,
                {
                    functionName: `${props.projectNamePrefix}-pre-signup`,
                    entry: join(__dirname, "custom-auth", "pre-signup.ts"),
                    runtime: cdk.aws_lambda.Runtime.NODEJS_22_X,
                    architecture: cdk.aws_lambda.Architecture.ARM_64,
                    bundling: {
                        format: cdk.aws_lambda_nodejs.OutputFormat.ESM,
                    },
                    ...props.functionProps?.preSignUp,
                    description: `[${props.environment}] Auto-confirm users on signup`,
                    environment: {
                        LOG_LEVEL: props.logLevel ?? "INFO",
                        ...props.functionProps?.preSignUp?.environment,
                    },
                }
            );
        }

        // Create Auth Challenge Lambda environment
        const createAuthChallengeEnvironment: Record<string, string> = {
            ALLOWED_ORIGINS: props.allowedOrigins.join(","),
            ALLOWED_APPLICATION_ORIGINS: "",
            LOG_LEVEL: props.logLevel ?? "INFO",
            MAGIC_LINK_ENABLED: "TRUE",
            EMAIL_FROM_ADDRESS: props.magicLink.emailFromAddress,
            SENDGRID_API_KEY_PARAMETER_NAME: sendgridApiKeyParameter.parameterName,
            KMS_KEY_ID:
                this.kmsKey instanceof cdk.aws_kms.Alias
                    ? this.kmsKey.aliasName
                    : this.kmsKey.keyId,
            DYNAMODB_SECRETS_TABLE: this.secretsTable.tableName,
            SECONDS_UNTIL_EXPIRY:
                props.magicLink.secondsUntilExpiry?.toSeconds().toString() ??
                "900",
            MIN_SECONDS_BETWEEN:
                props.magicLink.minimumSecondsBetween?.toSeconds().toString() ??
                "60",
            STACK_ID: cdk.Stack.of(scope).stackId,
        };
        // Create Auth Challenge Lambda
        this.createAuthChallengeFn = new cdk.aws_lambda_nodejs.NodejsFunction(
            this,
            `CreateAuthChallenge${id}`,
            {
                functionName: `${props.projectNamePrefix}-create-auth-challenge`,
                entry: join(
                    __dirname,
                    "custom-auth",
                    "create-auth-challenge.ts"
                ),
                runtime: cdk.aws_lambda.Runtime.NODEJS_22_X,
                architecture: cdk.aws_lambda.Architecture.ARM_64,
                bundling: {
                    format: cdk.aws_lambda_nodejs.OutputFormat.ESM,
                },
                timeout: cdk.Duration.seconds(5),
                ...props.functionProps?.createAuthChallenge,
                description: `[${props.environment}] Create authentication challenge (magic link)`,
                environment: {
                    ...createAuthChallengeEnvironment,
                    ...props.functionProps?.createAuthChallenge?.environment,
                },
            }
        );

        // Grant permissions to Create Auth Challenge Lambda
        this.secretsTable.grantReadWriteData(this.createAuthChallengeFn);
        sendgridApiKeyParameter.grantRead(this.createAuthChallengeFn);

        // Grant KMS signing permissions
        if ((this.kmsKey as cdk.aws_kms.IAlias).aliasName) {
            const permissions = {
                effect: cdk.aws_iam.Effect.ALLOW,
                resources: [
                    `arn:${cdk.Aws.PARTITION}:kms:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:key/*`,
                ],
                actions: ["kms:Sign"],
                conditions: {
                    StringLike: {
                        "kms:RequestAlias": (
                            this.kmsKey.node
                                .defaultChild as cdk.aws_kms.CfnAlias
                        ).aliasName,
                    },
                },
            };
            this.kmsKey.addToResourcePolicy(
                new cdk.aws_iam.PolicyStatement({
                    ...permissions,
                    principals: [
                        this.createAuthChallengeFn.role!.grantPrincipal,
                    ],
                })
            );
            this.createAuthChallengeFn.addToRolePolicy(
                new cdk.aws_iam.PolicyStatement(permissions)
            );
        } else {
            const permissions = {
                effect: cdk.aws_iam.Effect.ALLOW,
                resources: [this.kmsKey.keyArn],
                actions: ["kms:Sign"],
            };
            this.kmsKey.addToResourcePolicy(
                new cdk.aws_iam.PolicyStatement({
                    ...permissions,
                    principals: [
                        this.createAuthChallengeFn.role!.grantPrincipal,
                    ],
                })
            );
            this.createAuthChallengeFn.addToRolePolicy(
                new cdk.aws_iam.PolicyStatement(permissions)
            );
        }

        // Verify Auth Challenge Response Lambda environment
        const verifyAuthChallengeResponseEnvironment: Record<string, string> = {
            ALLOWED_ORIGINS: props.allowedOrigins.join(","),
            ALLOWED_APPLICATION_ORIGINS: "",
            LOG_LEVEL: props.logLevel ?? "INFO",
            MAGIC_LINK_ENABLED: "TRUE",
            DYNAMODB_SECRETS_TABLE: this.secretsTable.tableName,
            STACK_ID: cdk.Stack.of(scope).stackId,
        };

        // Verify Auth Challenge Response Lambda
        this.verifyAuthChallengeResponseFn =
            new cdk.aws_lambda_nodejs.NodejsFunction(
                this,
                `VerifyAuthChallengeResponse${id}`,
                {
                    functionName: `${props.projectNamePrefix}-verify-auth-challenge`,
                    entry: join(
                        __dirname,
                        "custom-auth",
                        "verify-auth-challenge-response.ts"
                    ),
                    runtime: cdk.aws_lambda.Runtime.NODEJS_22_X,
                    architecture: cdk.aws_lambda.Architecture.ARM_64,
                    bundling: {
                        format: cdk.aws_lambda_nodejs.OutputFormat.ESM,
                    },
                    timeout: cdk.Duration.seconds(5),
                    ...props.functionProps?.verifyAuthChallengeResponse,
                    description: `[${props.environment}] Verify authentication challenge response`,
                    environment: {
                        ...verifyAuthChallengeResponseEnvironment,
                        ...props.functionProps?.verifyAuthChallengeResponse
                            ?.environment,
                    },
                }
            );

        // Grant permissions to Verify Auth Challenge Response Lambda
        this.secretsTable.grantReadWriteData(
            this.verifyAuthChallengeResponseFn
        );

        // Grant KMS GetPublicKey permissions
        if ((this.kmsKey as cdk.aws_kms.IAlias).aliasName) {
            this.verifyAuthChallengeResponseFn.addToRolePolicy(
                new cdk.aws_iam.PolicyStatement({
                    effect: cdk.aws_iam.Effect.ALLOW,
                    resources: [
                        `arn:${cdk.Aws.PARTITION}:kms:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:key/*`,
                    ],
                    actions: ["kms:GetPublicKey"],
                    conditions: {
                        StringLike: {
                            "kms:RequestAlias": (
                                this.kmsKey as cdk.aws_kms.IAlias
                            ).aliasName,
                        },
                    },
                })
            );
        } else {
            this.verifyAuthChallengeResponseFn.addToRolePolicy(
                new cdk.aws_iam.PolicyStatement({
                    effect: cdk.aws_iam.Effect.ALLOW,
                    resources: [this.kmsKey.keyArn],
                    actions: ["kms:GetPublicKey"],
                })
            );
        }

        // Define Auth Challenge Lambda
        this.defineAuthChallengeResponseFn =
            new cdk.aws_lambda_nodejs.NodejsFunction(
                this,
                `DefineAuthChallenge${id}`,
                {
                    functionName: `${props.projectNamePrefix}-define-auth-challenge`,
                    entry: join(
                        __dirname,
                        "custom-auth",
                        "define-auth-challenge.ts"
                    ),
                    runtime: cdk.aws_lambda.Runtime.NODEJS_22_X,
                    architecture: cdk.aws_lambda.Architecture.ARM_64,
                    bundling: {
                        format: cdk.aws_lambda_nodejs.OutputFormat.ESM,
                    },
                    timeout: cdk.Duration.seconds(5),
                    ...props.functionProps?.defineAuthChallenge,
                    description: `[${props.environment}] Define authentication challenge flow`,
                    environment: {
                        LOG_LEVEL: props.logLevel ?? "INFO",
                        ...props.functionProps?.defineAuthChallenge
                            ?.environment,
                    },
                }
            );

        if (props.clientMetadataTokenKeys) {
            this.preTokenGenerationFn =
                new cdk.aws_lambda_nodejs.NodejsFunction(
                    this,
                    `PreToken${id}`,
                    {
                        functionName: `${props.projectNamePrefix}-pre-token-generation`,
                        entry: join(__dirname, "custom-auth", "pre-token.ts"),
                        runtime: cdk.aws_lambda.Runtime.NODEJS_22_X,
                        architecture: cdk.aws_lambda.Architecture.ARM_64,
                        bundling: {
                            format: cdk.aws_lambda_nodejs.OutputFormat.ESM,
                        },
                        ...props.functionProps?.preTokenGeneration,
                        description: `[${props.environment}] Pre-token generation trigger`,
                        environment: {
                            LOG_LEVEL: props.logLevel ?? "INFO",
                            CLIENT_METADATA_PERSISTED_KEYS: [
                                "signInMethod",
                                ...(props.clientMetadataTokenKeys ?? []),
                            ].join(","),
                            ...props.functionProps?.preTokenGeneration
                                ?.environment,
                        },
                    }
                );
        }

        const mergedProps: cdk.aws_cognito.UserPoolProps = {
            userPoolName: `${props.projectNamePrefix}-users`,
            passwordPolicy: {
                minLength: 8,
                requireDigits: true,
                requireUppercase: true,
                requireLowercase: true,
                requireSymbols: true,
            },
            signInAliases: {
                username: false,
                phone: false,
                preferredUsername: false,
                email: true,
            },
            selfSignUpEnabled: true, // Allow users to sign up themselves
            ...props.userPoolProps,
            lambdaTriggers: {
                ...props.userPoolProps?.lambdaTriggers,
                defineAuthChallenge: this.defineAuthChallengeResponseFn,
                createAuthChallenge: this.createAuthChallengeFn,
                verifyAuthChallengeResponse: this.verifyAuthChallengeResponseFn,
                preSignUp: this.preSignUpFn,
                preTokenGeneration: this.preTokenGenerationFn,
            },
        };
        this.userPool = new cdk.aws_cognito.UserPool(
            scope,
            `UserPool${id}`,
            mergedProps
        );

        // Create User Pool Client
        this.userPoolClient = this.userPool.addClient(`UserPoolClient${id}`, {
            authFlows: {
                custom: true,
                userPassword: false,
                userSrp: false,
            },
            preventUserExistenceErrors: false, // Allow frontend to detect and create users
        });
    }
}
