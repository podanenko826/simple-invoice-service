import { MonitoringThresholds } from "../stacks/constructs/monitoring/monitoring.js";

export interface EnvironmentConfig {
    projectNamePrefix: string;
    domainName: string;
    hostedZoneName: string;
    alertEmail: string;
    account: string;
    region: string;
    certificateRegion: string;
    crossRegionReferences: boolean;
    certificateStackDescription: string;
    mainStackDescription: string;
    monitoringThresholds?: MonitoringThresholds;
}