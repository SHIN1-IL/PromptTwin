export interface FormattedGeminiError {
	error: string;
	status: string;
}

export class MetaPromptGenerationError extends Error {
	constructor(
		message: string,
		readonly statusMessage: string,
	) {
		super(message);
		this.name = 'MetaPromptGenerationError';
	}
}

interface GeminiApiError extends Error {
	status: number;
}

function isGeminiApiError(error: unknown): error is GeminiApiError {
	return (
		error instanceof Error &&
		'status' in error &&
		typeof (error as GeminiApiError).status === 'number'
	);
}

function includesAny(text: string, needles: string[]): boolean {
	const lower = text.toLowerCase();
	return needles.some((needle) => lower.includes(needle));
}

export function formatGeminiError(error: unknown): FormattedGeminiError {
	if (error instanceof MetaPromptGenerationError) {
		return {
			error: error.message,
			status: error.statusMessage,
		};
	}

	if (isGeminiApiError(error)) {
		const detail = error.message.trim();

		if (error.status === 401 || error.status === 403) {
			return {
				error: 'Gemini API 인증에 실패했습니다. API 키를 확인해 주세요.',
				status: detail || 'API 키가 유효하지 않거나 권한이 없습니다.',
			};
		}

		if (error.status === 429 || includesAny(detail, ['quota', 'rate limit', 'resource_exhausted'])) {
			return {
				error: 'Gemini API 요청 한도에 도달했습니다.',
				status: detail || '잠시 후 다시 시도하거나 요금제/할당량을 확인해 주세요.',
			};
		}

		if (includesAny(detail, ['token', 'max_tokens', 'context length', 'too long'])) {
			return {
				error: '입력 또는 출력 토큰 제한을 초과했습니다.',
				status: detail || '요구사항을 더 짧게 작성하거나 나눠서 시도해 주세요.',
			};
		}

		return {
			error: 'Gemini API 호출 중 오류가 발생했습니다.',
			status: detail || `HTTP ${error.status}`,
		};
	}

	if (error instanceof Error) {
		const detail = error.message.trim();

		if (includesAny(detail, ['fetch failed', 'network', 'econnreset', 'etimedout'])) {
			return {
				error: '네트워크 연결에 실패했습니다.',
				status: detail || '인터넷 연결 상태를 확인한 뒤 다시 시도해 주세요.',
			};
		}

		return {
			error: detail || '알 수 없는 오류가 발생했습니다.',
			status: '생성에 실패했습니다. 잠시 후 다시 시도해 주세요.',
		};
	}

	return {
		error: '알 수 없는 오류가 발생했습니다.',
		status: '생성에 실패했습니다. 잠시 후 다시 시도해 주세요.',
	};
}

export function formatFinishReasonWarning(finishReason?: string): string | undefined {
	switch (finishReason) {
		case 'MAX_TOKENS':
			return '출력 토큰 한도에 도달했습니다. 결과가 중간에 잘렸을 수 있습니다.';
		case 'SAFETY':
			return '안전 필터로 인해 응답이 제한되었습니다.';
		case 'RECITATION':
			return '인용 제한으로 인해 응답이 중단되었습니다.';
		default:
			return undefined;
	}
}
