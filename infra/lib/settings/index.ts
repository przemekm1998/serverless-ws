import * as path from 'path';
import {promises as fs} from 'fs';


export interface EnvironmentSettings {
    envStage: string;
    projectName: string;
    projectEnvName: string;
    projectRootDir: string;
    webAppEnvVariables: EnvironmentVariables;
}


interface EnvironmentVariables {
    [name: string]: string;
}


interface WebAppConfig {
    envVariables: EnvironmentVariables;
}


interface ConfigFileContent {
    webAppConfig: WebAppConfig;
}


export interface EnvConfigFileContent {
    webAppConfig: WebAppConfig;
}


export async function loadEnvSettings(): Promise<EnvironmentSettings> {
    const projectName = process.env.PROJECT_NAME;
    const envStage = process.env.ENV_STAGE;

    if (!envStage) {
        throw new Error('Env ENV_STAGE is undefined!');
    }

    if (['local', 'test'].includes(envStage)) {
        throw new Error(`ENV_STAGE env cannot be set to '${envStage}'`)
    }

    const baseConfig = await readConfig();
    const envConfig = await readEnvConfig(envStage);

    return {
        envStage: envStage,
        projectName: projectName,
        projectEnvName: `${projectName}-${envStage}`,
        projectRootDir: process.env.PROJECT_ROOT_DIR,
        webAppEnvVariables: {
            ...(baseConfig?.webAppConfig?.envVariables || {}),
            ...(envConfig?.webAppConfig?.envVariables || {})
        }
    }
};


async function readConfig(): Promise<ConfigFileContent> {
    const configFileName = `.awsboilerplate.json`;
    const configFilePath = path.join(process.env.PROJECT_ROOT_DIR, configFileName);

    try {
        await fs.stat(configFilePath);
    } catch (err) {
        if (err.code === 'ENOENT') {
            throw new Error(`Config file ${configFileName} does not exist. `)
        }
        throw err;
    }

    const strContent = await fs.readFile(configFilePath, "utf8");
    return JSON.parse(strContent);
}


async function readEnvConfig(envStage: string): Promise<EnvConfigFileContent> {
    const envConfigFileName = `.awsboilerplate.${envStage}.json`;
    const envConfigFilePath = path.join(process.env.PROJECT_ROOT_DIR, envConfigFileName);

    try {
        await fs.stat(envConfigFilePath);
    } catch (err) {
        if (err.code === 'ENOENT') {
            throw new Error(`Config file ${envConfigFileName} for environment ${envStage} does not exist. `)
        }
        throw err;
    }

    const strContent = await fs.readFile(envConfigFilePath, "utf8");
    return JSON.parse(strContent);
}