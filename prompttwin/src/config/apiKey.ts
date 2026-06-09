import * as vscode from 'vscode';
import { parseEnvFile } from './parseEnv';
import { GEMINI_API_KEY_SECRET } from '../gemini/constants';

const ENV_KEYS = ['GEMINI_API_KEY', 'GOOGLE_API_KEY'] as const;

async function readEnvFromFile(fileUri: vscode.Uri): Promise<Record<string, string>> {
	try {
		const bytes = await vscode.workspace.fs.readFile(fileUri);
		return parseEnvFile(Buffer.from(bytes).toString('utf8'));
	} catch {
		return {};
	}
}

function pickApiKey(env: Record<string, string>): string | undefined {
	for (const key of ENV_KEYS) {
		const value = env[key]?.trim();
		if (value) {
			return value;
		}
	}
	return undefined;
}

function getEnvFileCandidates(extensionUri: vscode.Uri): vscode.Uri[] {
	const candidates: vscode.Uri[] = [];

	// Opened workspace root(s) — primary project .env in dev host / user workspace
	for (const folder of vscode.workspace.workspaceFolders ?? []) {
		candidates.push(vscode.Uri.joinPath(folder.uri, '.env'));
	}

	// Extension package root (prompttwin/.env)
	candidates.push(vscode.Uri.joinPath(extensionUri, '.env'));

	// Monorepo root when extension lives in a subfolder (e.g. PromptTwin/.env)
	candidates.push(vscode.Uri.joinPath(extensionUri, '..', '.env'));

	return candidates;
}

async function readApiKeyFromEnvFiles(
	extensionUri: vscode.Uri,
): Promise<string | undefined> {
	for (const envFilePath of getEnvFileCandidates(extensionUri)) {
		const apiKey = pickApiKey(await readEnvFromFile(envFilePath));
		if (apiKey) {
			return apiKey;
		}
	}

	return undefined;
}

function readApiKeyFromProcessEnv(): string | undefined {
	for (const key of ENV_KEYS) {
		const value = process.env[key]?.trim();
		if (value) {
			return value;
		}
	}
	return undefined;
}

export async function resolveGeminiApiKey(
	secrets: vscode.SecretStorage,
	extensionUri: vscode.Uri,
): Promise<string | undefined> {
	const fromSecrets = (await secrets.get(GEMINI_API_KEY_SECRET))?.trim();
	if (fromSecrets) {
		return fromSecrets;
	}

	const fromEnvFile = await readApiKeyFromEnvFiles(extensionUri);
	if (fromEnvFile) {
		return fromEnvFile;
	}

	return readApiKeyFromProcessEnv();
}

export const API_KEY_SETUP_HINT =
	'Gemini API 키가 없습니다. (1) 명령 팔레트에서 "PromptTwin: Set Gemini API Key"를 실행하거나, (2) 프로젝트 루트에 .env 파일을 만들고 GEMINI_API_KEY=... 를 설정하세요.';
