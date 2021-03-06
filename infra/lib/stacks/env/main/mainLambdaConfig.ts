import {EnvConstructProps} from "../../../types";
import {MainVpc} from "./mainVpc";
import {CfnOutput, Construct} from "@aws-cdk/core";
import { Port, SecurityGroup } from "@aws-cdk/aws-ec2";
import {EnvironmentSettings} from "../../../settings";

export interface MainLambdaConfigProps extends EnvConstructProps {
  mainVpc: MainVpc
}

export class MainLambdaConfig extends Construct {
  lambdaSecurityGroup: SecurityGroup

  constructor(scope: Construct, id: string, props: MainLambdaConfigProps) {
    super(scope, id);

    this.lambdaSecurityGroup = this.createLambdaSecurityGroup(props);
  }

  private createLambdaSecurityGroup(props: MainLambdaConfigProps): SecurityGroup {
    const sg = new SecurityGroup(this, "LambdaSecurityGroup", {
      vpc: props.mainVpc.vpc,
      allowAllOutbound: true,
      description: `${props.envSettings.projectName} Lambda function security group`
    });

    new CfnOutput(this, "LambdaSecurityGroupIdOutput", {
      exportName: MainLambdaConfig.getLambdaSecurityGroupIdOutputExportName(
        props.envSettings
      ),
      value: sg.securityGroupId,
    });

    return sg;
  }

    static getLambdaSecurityGroupIdOutputExportName(
    envSettings: EnvironmentSettings
  ) {
    return `${envSettings.projectEnvName}-lambdaSecurityGroupId`;
  }
}