import * as cdk from "aws-cdk-lib";
import { EnvironmentConfig } from "../shared/types.js";

export interface ExtendedStackProps extends cdk.StackProps {
    config: EnvironmentConfig;
}
