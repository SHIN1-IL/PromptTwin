# PromptTwin

Cursor/VS Code용 메타 프롬프트 생성 확장 프로그램입니다. 간단한 개발 요구사항을 Gemini API로 변환해 Cursor Agent에 바로 붙여넣을 수 있는 시니어 레벨 프롬프트를 만들어 줍니다.

## Features

- 사이드바 웹뷰에서 개발 요구사항 입력
- `gemini-2.5-flash` 기반 메타 프롬프트 생성
- 클립보드 복사 버튼 (Message Passing 방식)
- VS Code Secrets / `.env` API 키 지원

## Requirements

- Cursor 또는 VS Code 1.120+
- [Google AI Studio](https://aistudio.google.com/apikey) Gemini API 키

## Setup

1. `Cmd+Shift+P` → **PromptTwin: Set Gemini API Key**
2. 또는 프로젝트 루트 `.env`에 `GEMINI_API_KEY=...` 설정

## Commands

| Command | Description |
|---------|-------------|
| PromptTwin: Focus Panel | 사이드바 패널 포커스 |
| PromptTwin: Set Gemini API Key | API 키 저장 |
