#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {loadEnvSettings} from "../lib/settings";
import {EnvComponentsStack} from "../lib/stacks/env/components/stack";
import {EnvMainStack} from "../lib/stacks/env/main";

(async () => {
  const envSettings = await loadEnvSettings();

  const getStackName = (baseName: string, prefix: string) =>
    `${prefix}-${baseName}`;

  const app = new cdk.App();

  new EnvMainStack(app, getStackName("MainStack", envSettings.projectEnvName), {envSettings});
  new EnvComponentsStack(app, getStackName("ComponentsStack", envSettings.projectEnvName), {envSettings});
})();