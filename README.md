# Nano Banana Pro - Image Text Translator

이미지 내 텍스트를 한국어로 번역한 새 이미지를 생성합니다. (Gemini 3 Pro Image Preview 사용)

## Quick Start

```bash
# 1. 의존성 설치
cd server && bun install
cd ../client && bun install

# 2. API 키 설정
cd ../server
cp .env.example .env
# .env 파일에 GEMINI_API_KEY 입력

# 3. 실행
bun run dev              # 터미널 1: 서버 (localhost:3001)
cd ../client && bun run dev  # 터미널 2: 클라이언트 (localhost:5173)
```

**접속**: http://localhost:5173

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 단일 번역 | 드래그앤드롭으로 이미지 업로드 → 번역 |
| 일괄 처리 | 여러 이미지 동시 번역 (진행률 표시) |
| 이력 관리 | SQLite에 번역 결과 저장/조회/삭제 |
| 비교 보기 | 원본 ↔ 번역 이미지 토글 |
| 다운로드 | 번역된 이미지 저장 |

---

## 기술 스택

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + Zustand
- **Backend**: Bun.js + Express + SQLite (Bun 내장)
- **API**: Google Gemini 3 Pro Image Preview (`gemini-3-pro-image-preview`)

---

## API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/translate` | 단일 이미지 번역 |
| POST | `/api/translate/batch` | 일괄 번역 |
| GET | `/api/history` | 이력 조회 |
| GET | `/api/history/:id` | 단일 이력 조회 |
| DELETE | `/api/history/:id` | 이력 삭제 |
| DELETE | `/api/history` | 전체 이력 삭제 |
| GET | `/api/health` | 서버 상태 확인 |

<details>
<summary><b>API 상세 문서</b></summary>

### POST /api/translate

**Request:**
```json
{
  "image": "base64_encoded_image",
  "filename": "example.png",
  "mimeType": "image/png"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "originalImage": "base64...",
    "translatedImage": "base64...",
    "originalFilename": "example.png",
    "fileSize": 123456,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /api/translate/batch

**Request:**
```json
{
  "images": [
    { "image": "base64...", "filename": "img1.png", "mimeType": "image/png" },
    { "image": "base64...", "filename": "img2.jpg", "mimeType": "image/jpeg" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 2,
    "completed": 2,
    "results": [...],
    "errors": []
  }
}
```

</details>

---

## 프로젝트 구조

<details>
<summary><b>디렉토리 구조 보기</b></summary>

```
nano-banana-pro-image-translation/
├── client/                          # Frontend
│   ├── src/
│   │   ├── components/              # UI 컴포넌트
│   │   ├── hooks/useTranslation.ts  # API 호출 훅
│   │   ├── stores/historyStore.ts   # Zustand 스토어
│   │   └── types/index.ts           # TypeScript 타입
│   ├── vite.config.ts
│   └── package.json
│
├── server/                          # Backend
│   ├── src/
│   │   ├── routes/                  # API 라우트
│   │   ├── services/
│   │   │   ├── gemini.ts            # Gemini API 래퍼
│   │   │   └── database.ts          # SQLite 서비스
│   │   └── index.ts                 # 서버 진입점
│   ├── data/                        # SQLite DB 저장
│   ├── .env                         # 환경 변수
│   └── package.json
│
└── README.md
```

</details>

---

## 환경 변수

```env
# server/.env
GEMINI_API_KEY=your_api_key_here
PORT=3001
```

API 키 발급: [Google AI Studio](https://aistudio.google.com/)

---

## 지원 형식

PNG, JPEG, WebP, GIF (정적), HEIC/HEIF

---

## API 비용

- Standard: ~$0.039/이미지
- Batch: ~$0.0195/이미지

[가격 정보](https://ai.google.dev/gemini-api/docs/pricing)

---

## 문제 해결

| 오류 | 해결 |
|------|------|
| `GEMINI_API_KEY is not configured` | `server/.env`에 API 키 설정 확인 |
| `No translated image returned` | 텍스트가 없거나 API 제한 |
| `Failed to fetch` | 서버 실행 여부 확인 |

---

## License

MIT
