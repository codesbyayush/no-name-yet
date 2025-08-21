import { App } from "@octokit/app";
import type { AppEnv } from "./env";

let appInstance: App | null = null;

function getApp(env: AppEnv) {
	if (!appInstance) {
		appInstance = new App({
			appId: env.GITHUB_APP_ID,
			privateKey: env.GITHUB_PRIVATE_KEY,
		});
	}
	return appInstance;
}

export async function getInstallationOctokit(
	env: AppEnv,
	installationId: number,
) {
	const app = getApp(env);
	return app.getInstallationOctokit(installationId);
}
