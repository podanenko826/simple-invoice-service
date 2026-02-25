import * as cdk from "aws-cdk-lib";
import * as cf from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import { Construct } from "constructs";
import * as path from "path";
import { fileURLToPath } from "url";

export interface PublicWebsiteProps {
    readonly userPoolId: string;
    readonly userPoolClientId: string;
    readonly apiUrl: string;
    readonly certificateArn?: string;
    readonly domainName?: string;
}

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PublicWebsite extends Construct {
    readonly distribution: cf.Distribution;
    readonly websiteBucket: s3.Bucket;

    constructor(scope: Construct, id: string, props: PublicWebsiteProps) {
        super(scope, id);

        // Define paths relative to this construct file
        const appPath = path.resolve(__dirname, "../../../../frontend");

        // Create S3 bucket for website hosting
        this.websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            autoDeleteObjects: true,
            enforceSSL: true,
            encryption: s3.BucketEncryption.S3_MANAGED,
            versioned: false,
        });

        // Create Origin Access Control for CloudFront (replaces OAI)
        const originAccessControl = new cf.S3OriginAccessControl(
            this,
            "WebsiteOAC",
            {
                signing: cf.Signing.SIGV4_ALWAYS,
            }
        );

        // Grant CloudFront access to the bucket
        this.websiteBucket.addToResourcePolicy(
            new cdk.aws_iam.PolicyStatement({
                actions: ["s3:GetObject"],
                resources: [this.websiteBucket.arnForObjects("*")],
                principals: [
                    new cdk.aws_iam.ServicePrincipal(
                        "cloudfront.amazonaws.com"
                    ),
                ],
                conditions: {
                    StringEquals: {
                        "AWS:SourceArn": `arn:aws:cloudfront::${cdk.Stack.of(this).account}:distribution/*`,
                    },
                },
            })
        );

        // Response headers policy for security
        const responseHeadersPolicy = new cf.ResponseHeadersPolicy(
            this,
            "SecurityHeadersPolicy",
            {
                securityHeadersBehavior: {
                    contentSecurityPolicy: {
                        contentSecurityPolicy: [
                            "default-src 'self'",
                            `connect-src 'self' https://cognito-idp.${cdk.Stack.of(this).region}.amazonaws.com ${props.apiUrl}`,
                            "font-src 'self' data:",
                            "img-src 'self' data: blob:",
                            "media-src 'self' blob:",
                            "style-src 'self' 'unsafe-inline'",
                            "script-src 'self'",
                        ].join("; "),
                        override: true,
                    },
                    contentTypeOptions: { override: true },
                    frameOptions: {
                        frameOption: cf.HeadersFrameOption.DENY,
                        override: true,
                    },
                    referrerPolicy: {
                        referrerPolicy: cf.HeadersReferrerPolicy.NO_REFERRER,
                        override: true,
                    },
                    strictTransportSecurity: {
                        accessControlMaxAge: cdk.Duration.seconds(31536000),
                        includeSubdomains: true,
                        override: true,
                    },
                    xssProtection: {
                        protection: true,
                        modeBlock: true,
                        override: true,
                    },
                },
            }
        );

        // CloudFront distribution configuration
        const baseDistributionProps: cf.DistributionProps = {
            defaultRootObject: "index.html",
            priceClass: cf.PriceClass.PRICE_CLASS_100,
            httpVersion: cf.HttpVersion.HTTP2_AND_3,
            minimumProtocolVersion: cf.SecurityPolicyProtocol.TLS_V1_2_2021,
            enableLogging: false,
            defaultBehavior: {
                origin: origins.S3BucketOrigin.withOriginAccessControl(
                    this.websiteBucket,
                    {
                        originAccessControl: originAccessControl,
                    }
                ),
                viewerProtocolPolicy: cf.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cachePolicy: cf.CachePolicy.CACHING_OPTIMIZED,
                responseHeadersPolicy: responseHeadersPolicy,
                compress: true,
            },
            errorResponses: [
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: "/index.html",
                    ttl: cdk.Duration.minutes(5),
                },
                {
                    httpStatus: 403,
                    responseHttpStatus: 200,
                    responsePagePath: "/index.html",
                    ttl: cdk.Duration.minutes(5),
                },
            ],
        };

        // Add custom domain if certificate and domain are provided
        let distributionProps: cf.DistributionProps = baseDistributionProps;
        if (props.certificateArn && props.domainName) {
            distributionProps = {
                ...baseDistributionProps,
                certificate: acm.Certificate.fromCertificateArn(
                    this,
                    "Certificate",
                    props.certificateArn
                ),
                domainNames: [props.domainName],
            };
        }

        // Create CloudFront distribution
        this.distribution = new cf.Distribution(
            this,
            "Distribution",
            distributionProps
        );

        // Build frontend without environment variables (they'll be loaded at runtime)
        const asset = s3deploy.Source.asset(appPath, {
            bundling: {
                image: cdk.DockerImage.fromRegistry(
                    "public.ecr.aws/sam/build-nodejs22.x:latest"
                ),
                command: [
                    "sh",
                    "-c",
                    [
                        "echo 'Building frontend in Docker...'",
                        "npm --cache /tmp/.npm ci",
                        "npm --cache /tmp/.npm run build",
                        "cp -aur /asset-input/dist/* /asset-output/",
                    ].join(" && "),
                ],
            },
        });

        // Create runtime config file with actual values
        const runtimeConfig = {
            userPoolId: props.userPoolId,
            userPoolClientId: props.userPoolClientId,
            apiUrl: props.apiUrl,
            region: cdk.Stack.of(this).region,
        };

        // Deploy to S3 and invalidate CloudFront
        new s3deploy.BucketDeployment(this, "WebsiteDeployment", {
            prune: false,
            sources: [
                asset,
                s3deploy.Source.jsonData("config.json", runtimeConfig),
            ],
            destinationBucket: this.websiteBucket,
            distribution: this.distribution,
            distributionPaths: ["/*"],
        });

        // Outputs
        new cdk.CfnOutput(this, "WebsiteBucketName", {
            value: this.websiteBucket.bucketName,
            description: "S3 bucket for website files",
        });

        new cdk.CfnOutput(this, "DistributionId", {
            value: this.distribution.distributionId,
            description: "CloudFront distribution ID",
        });

        new cdk.CfnOutput(this, "DistributionDomainName", {
            value: this.distribution.distributionDomainName,
            description: "CloudFront distribution domain name",
        });

        new cdk.CfnOutput(this, "WebsiteUrl", {
            value: props.domainName
                ? `https://${props.domainName}`
                : `https://${this.distribution.distributionDomainName}`,
            description: "Website URL",
        });
    }
}
