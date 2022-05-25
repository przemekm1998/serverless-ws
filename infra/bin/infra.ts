#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { InfraStack } from '../lib/infra-stack';
import { loadEnvSettings } from "../lib/settings";

(async () => {
  const envSettings = await loadEnvSettings();

  const getStackName = (baseName: string, prefix: string) =>
    `${prefix}-${baseName}`;

  const app = new cdk.App();

  new EnvComponentsStack(app, getStackName("ComponentsStack", envSettings.projectEnvName), { envSettings });
})