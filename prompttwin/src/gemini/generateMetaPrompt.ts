import {
	formatFinishReasonWarning,
	MetaPromptGenerationError,
} from './formatGeminiError';
import { GEMINI_MODEL, MAX_OUTPUT_TOKENS } from './constants';
import { META_PROMPT_SYSTEM_INSTRUCTION } from './systemPrompt';

export interface MetaPromptResult {
	text: string;
	status?: string;
	statusIsWarning?: boolean;
}

export async function generateMetaPrompt(
	apiKey: string,
	requirements: string,
): Promise<MetaPromptResult> {
	const { GoogleGenAI } = await import('@google/genai');
	const ai = new GoogleGenAI({ apiKey });

	const response = await ai.models.generateContent({
		model: GEMINI_MODEL,
		contents: requirements,
		config: {
			systemInstruction: META_PROMPT_SYSTEM_INSTRUCTION,
			maxOutputTokens: MAX_OUTPUT_TOKENS,
			temperature: 0.7,
		},
	});

	const blockReason = response.promptFeedback?.blockReason;
	if (blockReason) {
		const blockMessage =
			response.promptFeedback?.blockReasonMessage ??
			'프롬프트가 콘텐츠 정책에 의해 차단되었습니다.';

		throw new MetaPromptGenerationError(
			blockMessage,
			`입력이 차단되었습니다 (${blockReason}). 요구사항을 수정해 주세요.`,
		);
	}

	const candidate = response.candidates?.[0];
	const text = response.text?.trim();

	if (!text) {
		throw new MetaPromptGenerationError(
			'모델이 빈 응답을 반환했습니다.',
			'응답을 생성하지 못했습니다. 요구사항을 다시 확인해 주세요.',
		);
	}

	const finishReason = candidate?.finishReason;
	const finishWarning = formatFinishReasonWarning(finishReason);

	if (finishReason === 'SAFETY') {
		throw new MetaPromptGenerationError(
			text,
			finishWarning ?? '안전 필터로 인해 응답이 제한되었습니다.',
		);
	}

	return {
		text,
		status: finishWarning ?? '생성이 완료되었습니다.',
		statusIsWarning: Boolean(finishWarning),
	};
}
