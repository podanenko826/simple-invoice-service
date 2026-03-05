import * as cdk from "aws-cdk-lib";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as cloudwatch_actions from "aws-cdk-lib/aws-cloudwatch-actions";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

export interface MonitoringThresholds {
    /** Threshold for 4XX errors (default: 10 errors in 5 minutes) */
    api4xxErrors?: number;
    /** Threshold for 5XX errors (default: 5 errors in 5 minutes) */
    api5xxErrors?: number;
    /** Threshold for API latency in milliseconds (default: 3000ms) */
    apiLatency?: number;
    /** Number of evaluation periods for latency alarm (default: 2) */
    apiLatencyEvaluationPeriods?: number;
    /** Threshold for Cognito authentication failures (default: 10 failures in 5 minutes) */
    cognitoAuthFailures?: number;
    /** Threshold for Cognito throttles (default: 5 throttles in 5 minutes) */
    cognitoThrottles?: number;
}

export interface MonitoringProps {
    api: apigateway.RestApi;
    userPool: cognito.UserPool;
    alertEmail: string;
    environment: string;
    /** Custom thresholds for alarms (optional, uses defaults if not provided) */
    thresholds?: MonitoringThresholds;
}

export class Monitoring extends Construct {
    public readonly alarmTopic: sns.Topic;
    public readonly dashboard: cloudwatch.Dashboard;

    constructor(scope: Construct, id: string, props: MonitoringProps) {
        super(scope, id);

        const { api, userPool, alertEmail, environment, thresholds = {} } = props;

        // Apply default thresholds
        const {
            api4xxErrors = 10,
            api5xxErrors = 5,
            apiLatency = 3000,
            apiLatencyEvaluationPeriods = 2,
            cognitoAuthFailures = 10,
            cognitoThrottles = 5,
        } = thresholds;

        // SNS Topic for Alarms
        this.alarmTopic = new sns.Topic(this, "AlarmTopic", {
            displayName: `OneThing Invoice Alerts - ${environment}`,
            topicName: `ot-invoice-alerts-${environment}`,
        });

        // Subscribe email to alarms
        this.alarmTopic.addSubscription(
            new subscriptions.EmailSubscription(alertEmail)
        );

        // ========================================
        // API Gateway Monitoring
        // ========================================

        // 1. High Error Rate (4XX)
        const api4xxAlarm = new cloudwatch.Alarm(this, "Api4xxAlarm", {
            alarmName: `ot-${environment}-api-high-4xx-errors`,
            alarmDescription: "Alert when API has high client error rate",
            metric: api.metricClientError({
                statistic: "Sum",
                period: cdk.Duration.minutes(5),
            }),
            threshold: api4xxErrors,
            evaluationPeriods: 1,
            comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
            treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
        });
        api4xxAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(this.alarmTopic));

        // 2. High Error Rate (5XX)
        const api5xxAlarm = new cloudwatch.Alarm(this, "Api5xxAlarm", {
            alarmName: `ot-${environment}-api-high-5xx-errors`,
            alarmDescription: "Alert when API has server errors",
            metric: api.metricServerError({
                statistic: "Sum",
                period: cdk.Duration.minutes(5),
            }),
            threshold: api5xxErrors,
            evaluationPeriods: 1,
            comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
            treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
        });
        api5xxAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(this.alarmTopic));

        // 3. High Latency
        const apiLatencyAlarm = new cloudwatch.Alarm(this, "ApiLatencyAlarm", {
            alarmName: `ot-${environment}-api-high-latency`,
            alarmDescription: "Alert when API latency is high",
            metric: api.metricLatency({
                statistic: "Average",
                period: cdk.Duration.minutes(5),
            }),
            threshold: apiLatency,
            evaluationPeriods: apiLatencyEvaluationPeriods,
            comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
            treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
        });
        apiLatencyAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(this.alarmTopic));

        // ========================================
        // Cognito Monitoring
        // ========================================

        // 4. Sign-in Failures
        const cognitoSignInFailures = new cloudwatch.Metric({
            namespace: "AWS/Cognito",
            metricName: "UserAuthenticationFailure",
            dimensionsMap: {
                UserPool: userPool.userPoolId,
            },
            statistic: "Sum",
            period: cdk.Duration.minutes(5),
        });

        const cognitoFailureAlarm = new cloudwatch.Alarm(this, "CognitoFailureAlarm", {
            alarmName: `ot-${environment}-cognito-auth-failures`,
            alarmDescription: "Alert when authentication failures are high",
            metric: cognitoSignInFailures,
            threshold: cognitoAuthFailures,
            evaluationPeriods: 1,
            comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
            treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
        });
        cognitoFailureAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(this.alarmTopic));

        // 5. Throttled Requests (Rate Limiting)
        const cognitoThrottlesMetric = new cloudwatch.Metric({
            namespace: "AWS/Cognito",
            metricName: "UserAuthenticationThrottle",
            dimensionsMap: {
                UserPool: userPool.userPoolId,
            },
            statistic: "Sum",
            period: cdk.Duration.minutes(5),
        });

        const cognitoThrottleAlarm = new cloudwatch.Alarm(this, "CognitoThrottleAlarm", {
            alarmName: `ot-${environment}-cognito-throttles`,
            alarmDescription: "Alert when Cognito is throttling requests",
            metric: cognitoThrottlesMetric,
            threshold: cognitoThrottles,
            evaluationPeriods: 1,
            comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
            treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
        });
        cognitoThrottleAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(this.alarmTopic));

        // ========================================
        // CloudWatch Dashboard
        // ========================================

        this.dashboard = new cloudwatch.Dashboard(this, "Dashboard", {
            dashboardName: `OneThing-Invoice-${environment}`,
        });

        // API Gateway Metrics
        this.dashboard.addWidgets(
            new cloudwatch.GraphWidget({
                title: "API Request Count",
                left: [
                    api.metricCount({
                        statistic: "Sum",
                        period: cdk.Duration.minutes(5),
                        label: "Total Requests",
                    }),
                ],
                width: 12,
            }),
            new cloudwatch.GraphWidget({
                title: "API Error Rates",
                left: [
                    api.metricClientError({
                        statistic: "Sum",
                        period: cdk.Duration.minutes(5),
                        label: "4XX Errors",
                        color: cloudwatch.Color.ORANGE,
                    }),
                    api.metricServerError({
                        statistic: "Sum",
                        period: cdk.Duration.minutes(5),
                        label: "5XX Errors",
                        color: cloudwatch.Color.RED,
                    }),
                ],
                width: 12,
            })
        );

        this.dashboard.addWidgets(
            new cloudwatch.GraphWidget({
                title: "API Latency",
                left: [
                    api.metricLatency({
                        statistic: "Average",
                        period: cdk.Duration.minutes(5),
                        label: "Average Latency",
                        color: cloudwatch.Color.BLUE,
                    }),
                    api.metricLatency({
                        statistic: "p99",
                        period: cdk.Duration.minutes(5),
                        label: "P99 Latency",
                        color: cloudwatch.Color.PURPLE,
                    }),
                ],
                width: 12,
            }),
            new cloudwatch.SingleValueWidget({
                title: "Current Error Rate",
                metrics: [
                    api.metricClientError({
                        statistic: "Sum",
                        period: cdk.Duration.minutes(5),
                    }),
                ],
                width: 6,
            }),
            new cloudwatch.SingleValueWidget({
                title: "Avg Latency (5m)",
                metrics: [
                    api.metricLatency({
                        statistic: "Average",
                        period: cdk.Duration.minutes(5),
                    }),
                ],
                width: 6,
            })
        );

        // Cognito Metrics
        this.dashboard.addWidgets(
            new cloudwatch.GraphWidget({
                title: "Authentication Activity",
                left: [
                    new cloudwatch.Metric({
                        namespace: "AWS/Cognito",
                        metricName: "UserAuthentication",
                        dimensionsMap: {
                            UserPool: userPool.userPoolId,
                        },
                        statistic: "Sum",
                        period: cdk.Duration.minutes(5),
                        label: "Successful Logins",
                        color: cloudwatch.Color.GREEN,
                    }),
                    cognitoSignInFailures.with({
                        label: "Failed Logins",
                        color: cloudwatch.Color.RED,
                    }),
                ],
                width: 12,
            }),
            new cloudwatch.GraphWidget({
                title: "Cognito Throttles & Token Refresh",
                left: [
                    cognitoThrottlesMetric.with({
                        label: "Throttled Requests",
                        color: cloudwatch.Color.ORANGE,
                    }),
                    new cloudwatch.Metric({
                        namespace: "AWS/Cognito",
                        metricName: "TokenRefreshSuccesses",
                        dimensionsMap: {
                            UserPool: userPool.userPoolId,
                        },
                        statistic: "Sum",
                        period: cdk.Duration.minutes(5),
                        label: "Token Refreshes",
                        color: cloudwatch.Color.BLUE,
                    }),
                ],
                width: 12,
            })
        );

        // Alarm Status Widget
        this.dashboard.addWidgets(
            new cloudwatch.AlarmStatusWidget({
                title: "Alarm Status",
                alarms: [
                    api4xxAlarm,
                    api5xxAlarm,
                    apiLatencyAlarm,
                    cognitoFailureAlarm,
                    cognitoThrottleAlarm,
                ],
                width: 24,
            })
        );

        // Outputs
        new cdk.CfnOutput(scope, "DashboardUrl", {
            value: `https://console.aws.amazon.com/cloudwatch/home?region=${cdk.Stack.of(this).region}#dashboards:name=${this.dashboard.dashboardName}`,
            description: "CloudWatch Dashboard URL",
        });

        new cdk.CfnOutput(scope, "AlarmTopicArn", {
            value: this.alarmTopic.topicArn,
            description: "SNS Topic ARN for alarms",
        });
    }
}
