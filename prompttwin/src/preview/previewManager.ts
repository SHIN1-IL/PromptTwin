import * as vscode from 'vscode';

let previewDocument: vscode.TextDocument | undefined;

export async function openPreviewDocument(text: string): Promise<void> {
	await closePreviewDocument();

	const document = await vscode.workspace.openTextDocument({
		content: text,
		language: 'markdown',
	});

	previewDocument = document;

	await vscode.window.showTextDocument(document, {
		preview: false,
		viewColumn: vscode.ViewColumn.One,
	});
}

export async function closePreviewDocument(): Promise<boolean> {
	if (!previewDocument) {
		return false;
	}

	const targetUri = previewDocument.uri.toString();
	const tabsToClose: vscode.Tab[] = [];

	for (const group of vscode.window.tabGroups.all) {
		for (const tab of group.tabs) {
			const input = tab.input;
			if (input instanceof vscode.TabInputText && input.uri.toString() === targetUri) {
				tabsToClose.push(tab);
			}
		}
	}

	if (tabsToClose.length > 0) {
		await vscode.window.tabGroups.close(tabsToClose);
	}

	previewDocument = undefined;
	return tabsToClose.length > 0;
}

export function isPreviewOpen(): boolean {
	return previewDocument !== undefined;
}

export function registerPreviewCleanup(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		vscode.workspace.onDidCloseTextDocument((document) => {
			if (previewDocument && document.uri.toString() === previewDocument.uri.toString()) {
				previewDocument = undefined;
			}
		}),
	);
}
