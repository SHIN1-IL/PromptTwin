import * as vscode from 'vscode';

function getNonce(): string {
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let nonce = '';
	for (let i = 0; i < 32; i++) {
		nonce += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return nonce;
}

export function getWebviewContent(
	webview: vscode.Webview,
	extensionUri: vscode.Uri,
): string {
	const nonce = getNonce();
	const styleUri = webview.asWebviewUri(
		vscode.Uri.joinPath(extensionUri, 'media', 'panel.css'),
	);

	return `<!DOCTYPE html>
<html lang="ko">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
	<link rel="stylesheet" href="${styleUri}">
	<title>PromptTwin</title>
</head>
<body>
	<div class="panel">
		<header class="panel__header">
			<h1 class="panel__title">PromptTwin</h1>
			<p class="panel__subtitle">간단한 개발 요구사항을 메타 프롬프트로 변환합니다.</p>
		</header>

		<section class="section">
			<label class="section__label" for="requirements">개발 요구사항</label>
			<textarea
				id="requirements"
				class="requirements-input"
				placeholder="예: React로 할 일 목록 앱을 만들고, 로컬 스토리지에 저장해 주세요."
				rows="5"
			></textarea>
		</section>

		<button id="generateBtn" class="generate-btn" type="button">
			<span class="generate-btn__spinner" aria-hidden="true"></span>
			<span class="generate-btn__label">메타 프롬프트 생성</span>
		</button>

		<section class="section">
			<label class="section__label" for="result">생성 결과</label>
			<div
				id="result"
				class="result-box is-empty"
				role="status"
				aria-live="polite"
			>아직 생성된 결과가 없습니다. 요구사항을 입력한 뒤 버튼을 눌러 주세요.</div>
			<button id="copy-btn" class="copy-btn" type="button" disabled>📋 결과 복사하기</button>
		</section>

		<p id="statusBar" class="status-bar" aria-live="polite"></p>
	</div>

	<script nonce="${nonce}">
		const vscode = acquireVsCodeApi();

		const requirementsEl = document.getElementById('requirements');
		const generateBtn = document.getElementById('generateBtn');
		const resultEl = document.getElementById('result');
		const copyBtn = document.getElementById('copy-btn');
		const statusBarEl = document.getElementById('statusBar');

		let copyableText = '';

		function setLoading(isLoading) {
			generateBtn.disabled = isLoading;
			generateBtn.classList.toggle('is-loading', isLoading);
			requirementsEl.disabled = isLoading;
			if (isLoading) {
				copyBtn.disabled = true;
			}
		}

		function updateCopyButton() {
			copyBtn.disabled = !copyableText.trim();
		}

		function setResult(text, { isError = false, copyable = false } = {}) {
			const hasContent = Boolean(text && text.trim());
			resultEl.textContent = hasContent
				? text
				: '아직 생성된 결과가 없습니다. 요구사항을 입력한 뒤 버튼을 눌러 주세요.';
			resultEl.classList.toggle('is-empty', !hasContent);
			resultEl.classList.toggle('is-error', isError);

			if (copyable && hasContent && !isError) {
				copyableText = text.trim();
			} else if (isError || !hasContent) {
				copyableText = '';
			}

			updateCopyButton();
		}

		function setStatus(text, { isError = false, isWarning = false } = {}) {
			statusBarEl.textContent = text || '';
			statusBarEl.classList.toggle('is-error', isError);
			statusBarEl.classList.toggle('is-warning', isWarning && !isError);
		}

		generateBtn.addEventListener('click', () => {
			const requirements = requirementsEl.value.trim();
			if (!requirements) {
				setStatus('개발 요구사항을 입력해 주세요.', { isError: true });
				requirementsEl.focus();
				return;
			}

			setStatus('');
			setLoading(true);
			setResult('메타 프롬프트를 생성하는 중입니다...', { isError: false });
			resultEl.classList.remove('is-empty');

			copyableText = '';
			updateCopyButton();

			vscode.postMessage({
				type: 'generateMetaPrompt',
				requirements,
			});
		});

		copyBtn.addEventListener('click', () => {
			const text = copyableText.trim();
			if (!text) {
				setStatus('복사할 결과가 없습니다.', { isError: true });
				return;
			}

			vscode.postMessage({
				command: 'copyText',
				text,
			});
		});

		window.addEventListener('message', (event) => {
			const message = event.data;
			if (!message || typeof message !== 'object') {
				return;
			}

			switch (message.type) {
				case 'metaPromptResult':
					setLoading(false);
					setResult(message.result ?? '', { isError: false, copyable: true });
					setStatus(message.status ?? '생성이 완료되었습니다.', {
						isError: false,
						isWarning: Boolean(message.statusIsWarning),
					});
					break;
				case 'metaPromptError':
					setLoading(false);
					setResult(message.error ?? '알 수 없는 오류가 발생했습니다.', { isError: true });
					setStatus(message.status ?? '생성에 실패했습니다.', { isError: true });
					break;
			}
		});
	</script>
</body>
</html>`;
}
