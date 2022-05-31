import {EnvConstructProps} from "../../../types";
import {App, Stack, StackProps} from "@aws-cdk/core";
import {MainVpc} from "./mainVpc";
import {MainLambdaConfig} from "./mainLambdaConfig";

export interface EnvMainStackProps extends StackProps, EnvConstructProps {}

export class EnvMainStack extends Stack {
  mainVpc: MainVpc;
  mainLambdaConfig: MainLambdaConfig

  constructor(scope: App, id: string, props: EnvMainStackProps) {
    super(scope, id, props);

    const {envSettings} = props;

    this.mainVpc = new MainVpc(this, "MainVPC", {envSettings});
    this.mainLambdaConfig = new MainLambdaConfig(this, "MainLambdaConfig", {
      envSettings,
      mainVpc: this.mainVpc
    })
  }
}