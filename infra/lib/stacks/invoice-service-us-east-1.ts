import * as cdk from "aws-cdk-lib";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as certmgr from "aws-cdk-lib/aws-certificatemanager";
import { Construct } from "constructs";
import { ExtendedStackProps } from "./ExtendedStackProps.js";

export class CertificatesStack extends cdk.Stack {
    readonly certificate: certmgr.Certificate;
    readonly certificateArn: string;
    readonly hostedZone: route53.IHostedZone;

    constructor(scope: Construct, id: string, props: ExtendedStackProps) {
        super(scope, id, props);
        const config = props.config;

        // Look up the existing hosted zone
        this.hostedZone = route53.HostedZone.fromLookup(this, "HostedZone", {
            domainName: config.hostedZoneName,
        });

        // Create certificate for CloudFront (must be in us-east-1)
        this.certificate = new certmgr.Certificate(this, "Certificate", {
            domainName: config.domainName,
            validation: certmgr.CertificateValidation.fromDns(this.hostedZone),
        });

        this.certificateArn = this.certificate.certificateArn;

        // Output the certificate ARN
        new cdk.CfnOutput(this, "CertificateArn", {
            value: this.certificateArn,
            description: "ACM Certificate ARN for CloudFront",
            exportName: "CloudFrontCertificateArn",
        });
    }
}
