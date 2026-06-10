// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { API_KEY_SETUP_HINT, resolveGeminiApiKey } from './config/apiKey';
import { PROMPTTWIN_VIEW_CONTAINER_ID, PROMPTTWIN_VIEW_ID } from './constants';
import { GEMINI_API_KEY_SECRET } from './gemini/constants';
import { formatGeminiError } from './gemini/formatGeminiError';
import { generateMetaPrompt } from './gemini/generateMetaPrompt';
import {
	closePreviewDocument,
	isPreviewOpen,
	openPreviewDocument,
	registerPreviewCleanup,
} from './preview/previewManager';
import { getWebviewContent } from './webview/getWebviewContent';

class PromptTwinViewProvider implements vscode.WebviewViewProvider {
	constructor(
		private readonly extensionUri: vscode.Uri,
		private readonly secrets: vscode.SecretStorage,
	) {}

	resolveWebviewView(
		webviewView: vscode.WebviewView,
		_context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	): void {
		const { webview } = webviewView;

		webview.options = {
			enableScripts: true,
			localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'media')],
		};

		webview.html = getWebviewContent(webview, this.extensionUri);

		webview.onDidReceiveMessage(async (message: {
			type?: string;
			command?: string;
			requirements?: string;
			text?: string;
		}) => {
			if (message.command === 'copyText') {
				const text = message.text?.trim();
				if (!text) {
					void vscode.window.showWarningMessage('복사할 메타 프롬프트가 없습니다.');
					return;
				}

				await vscode.env.clipboard.writeText(text);
				void vscode.window.showInformationMessage('📋 메타 프롬프트가 클립보드에 복사되었습니다!');
				return;
			}

			if (message.command === 'previewText') {
				const text = message.text?.trim();
				if (!text) {
					void vscode.window.showWarningMessage('미리 볼 결과가 없습니다.');
					webview.postMessage({ type: 'previewState', isOpen: false });
					return;
				}

				await openPreviewDocument(text);
				void vscode.window.showInformationMessage('중앙 에디터에서 결과를 미리 볼 수 있습니다.');
				webview.postMessage({ type: 'previewState', isOpen: true });
				return;
			}

			if (message.command === 'closePreview') {
				const closed = await closePreviewDocument();
				webview.postMessage({ type: 'previewState', isOpen: isPreviewOpen() });

				if (closed) {
					void vscode.window.showInformationMessage('미리보기 창을 닫았습니다.');
				} else {
					void vscode.window.showInformationMessage('열린 미리보기 창이 없습니다.');
				}
				return;
			}

			if (message.type !== 'generateMetaPrompt') {
				return;
			}

			const requirements = message.requirements?.trim();
			if (!requirements) {
				webview.postMessage({
					type: 'metaPromptError',
					error: '개발 요구사항이 비어 있습니다.',
					status: '요구사항을 입력한 뒤 다시 시도해 주세요.',
				});
				return;
			}

			try {
				const apiKey = await resolveGeminiApiKey(this.secrets, this.extensionUri);
				if (!apiKey) {
					webview.postMessage({
						type: 'metaPromptError',
						error: API_KEY_SETUP_HINT,
						status: 'API 키 설정이 필요합니다.',
					});
					return;
				}

				const result = await generateMetaPrompt(apiKey, requirements);

				webview.postMessage({
					type: 'metaPromptResult',
					result: result.text,
					status: result.status,
					statusIsWarning: result.statusIsWarning ?? false,
				});
			} catch (error) {
				const formatted = formatGeminiError(error);

				webview.postMessage({
					type: 'metaPromptError',
					error: formatted.error,
					status: formatted.status,
				});
			}
		});
	}
}

async function setGeminiApiKey(secrets: vscode.SecretStorage): Promise<void> {
	const apiKey = await vscode.window.showInputBox({
		title: 'PromptTwin: Gemini API Key',
		prompt: 'Google AI Studio에서 발급한 Gemini API 키를 입력하세요.',
		password: true,
		ignoreFocusOut: true,
		placeHolder: 'AIza...',
	});

	if (!apiKey?.trim()) {
		return;
	}

	await secrets.store(GEMINI_API_KEY_SECRET, apiKey.trim());
	void vscode.window.showInformationMessage('Gemini API 키가 VS Code Secrets에 안전하게 저장되었습니다.');
}

async function focusPromptTwinPanel(): Promise<void> {
	await vscode.commands.executeCommand(`workbench.view.extension.${PROMPTTWIN_VIEW_CONTAINER_ID}`);
	await vscode.commands.executeCommand(`${PROMPTTWIN_VIEW_ID}.focus`);
}

export function activate(context: vscode.ExtensionContext) {
	console.log('PromptTwin extension is now active.');

	registerPreviewCleanup(context);

	const provider = new PromptTwinViewProvider(context.extensionUri, context.secrets);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(PROMPTTWIN_VIEW_ID, provider, {
			webviewOptions: {
				retainContextWhenHidden: true,
			},
		}),
		vscode.commands.registerCommand('prompttwin.focus', () => focusPromptTwinPanel()),
		vscode.commands.registerCommand('prompttwin.setGeminiApiKey', () =>
			setGeminiApiKey(context.secrets),
		),
		vscode.commands.registerCommand('prompttwin.helloWorld', () => {
			vscode.window.showInformationMessage('Hello World from PromptTwin!');
		}),
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
