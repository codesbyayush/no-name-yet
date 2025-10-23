import { App } from '@octokit/app';
import type { AppEnv } from './env';

let appInstance: App | null = null;

function getApp(env: AppEnv) {
  if (!appInstance) {
    appInstance = new App({
      appId: env.GH_APP_ID,
      privateKey: env.GH_PRIVATE_KEY,
    });
  }
  return appInstance;
}

export async function getInstallationOctokit(
  env: AppEnv,
  installationId: number
): Promise<Awaited<ReturnType<App['getInstallationOctokit']>>> {
  const app = getApp(env);
  return await app.getInstallationOctokit(installationId);
}
