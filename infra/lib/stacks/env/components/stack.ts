import {StackProps} from '@aws-cdk/core';
import {EnvConstructProps} from "../../../types";
import * as core from '@aws-cdk/core';
import {WebSocketApi, WebSocketStage} from "@aws-cdk/aws-apigatewayv2";
import { EnvironmentSettings } from '../../../settings';
import { CfnOutput } from 'aws-cdk-lib';


export interface EnvComponentsStackProps extends StackProps, EnvConstructProps {};


export class EnvComponentsStack extends core.Stack {
    static getWebSocketApiName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-websocket-api`
    };

    static getWebSocketApiIdOutputExportName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-webSocketApiId`
    };

    static getWebSocketApiEndpointOutputExportName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-webSocketApiEndpoint`
    };

    constructor(scope: core.App, id: string, props: EnvComponentsStackProps) {
        super(scope, id, props);

        this.createWebSocketApi(props);
    }

    private createWebSocketApi(props: EnvComponentsStackProps) {
        const webSocketApi = new WebSocketApi(this, "WebSocketApi", {
            apiName: EnvComponentsStack.getWebSocketApiName(props.envSettings)
        });
        new WebSocketStage(this, "WebSocketStage", {
            stageName: props.envSettings.envStage,
            webSocketApi: webSocketApi,
            autoDeploy: true
        });

        new CfnOutput(this, "WebSocketApiId", {
            exportName: EnvComponentsStack.getWebSocketApiIdOutputExportName(props.envSettings),
            value: webSocketApi.apiId
        });
        new CfnOutput(this, "WebSocketApiEndpoint", {
            exportName: EnvComponentsStack.getWebSocketApiEndpointOutputExportName(props.envSettings),
            value: webSocketApi.apiEndpoint
        });
    }
}