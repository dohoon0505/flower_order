# AGENTS.md — AI 에이전트 진입점

> **대상**: LLM·에이전트·자동화 도구. 이 저장소의 꽃배달 직배송 플랫폼을 **읽고 · 찾고 · 수정**할 때 이 문서부터 읽으면 모든 쿼리를 **1–2 파일 read**로 해결할 수 있습니다.
>
> **사람 읽기용**: [CLAUDE.md](CLAUDE.md) · [README.md](README.md)

---

## 핵심 원칙

1. **단일 진입점** — `system.json` (루트)에서 모든 리소스로 분기.
2. **3계층 동시 갱신** — 운영 소스 + 데이터 + 문서를 함께 수정.
3. **두 가지 콘텐츠** — 지역별 업체(`shops/`) + 꽃배달 가이드 블로그(`posts/`).

---

## "I want to... → Read this"

| 목표 | 첫 번째 read | 두 번째 read (필요 시) |
| --- | --- | --- |
| 시스템 전체 파악 | `system.json` | — |
| 상품 카테고리 목록 | `system.json` → `categories[]` | — |
| 등록된 업체 목록 | `system.json` → `shops[]` | — |
| 특정 업체 상세 정보 | `shops/{id}/info.json` | — |
| 블로그 글 목록 | `system.json` → `posts[]` | — |
| 특정 블로그 글 | `posts/{slug}/post.json` | — |
| 배송 정보 | `system.json` → `delivery` | — |
| 프로젝트 기여 가이드 | `CLAUDE.md` | — |

---

## 새 업체 추가

1. `shops/{id}/info.json` 작성 (필수 필드: `id`, `name`, `region`)
2. `system.json.shops[]` 배열에 엔트리 추가 (`id`, `name`, `region`)
3. `system.json.counts.shops` 갱신
4. `node scripts/validate.mjs` 실행

## 새 블로그 글 추가

1. `posts/{slug}/post.json` 작성 (필수 필드: `id`, `title`, `date`, `blocks[]`)
2. `system.json.posts[]` 배열에 엔트리 추가 (`id`, `title`, `category`, `date`)
3. `system.json.counts.posts` 갱신
4. `node scripts/validate.mjs` 실행

---

## 파일 구조

```
flower_order/
├── system.json                 ← AI 진입점
├── AGENTS.md                   ← (이 문서)
├── CLAUDE.md                   ← 기여 가이드
├── README.md                   ← 프로젝트 소개
│
├── shops/                      ← 지역별 업체 데이터
│   └── {id}/
│       └── info.json           ← 업체 상세 정보
│
├── posts/                      ← 꽃배달 가이드 블로그
│   └── {slug}/
│       └── post.json           ← 블로그 글 본문
│
├── scripts/
│   └── validate.mjs            ← 무결성 검증
│
├── index.html                  ← 운영 진본 (브라우저용 사이트)
├── assets/css/main.css
└── assets/js/main.js
```

---

## AI가 실수하기 쉬운 것

1. **3계층 미동기화** — 한 계층만 수정하면 검증 스크립트가 잡아냄.
2. **system.json에만 등록하고 폴더 미생성** — 검증 스크립트가 잡아냄.
3. **사용자 입력 미이스케이프** — 텍스트는 반드시 `escapeHtml()` 적용.
4. **외부 링크에 noopener 누락** — `target="_blank" rel="noopener noreferrer"` 필수.
