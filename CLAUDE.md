# CLAUDE.md — 기여 가이드라인

본 프로젝트(꽃배달 직배송 플랫폼)에 변경을 가할 때 따라야 할 원칙입니다.

## 프로젝트 개요

농장에서 당일 수확한 꽃을 중간 유통 없이 직접 배송하는 꽃배달 직배송 플랫폼입니다. 전국 각 지역의 직배송 가능한 꽃배달 업체를 소개하고, 꽃에 대한 유용한 정보를 블로그(꽃배달 가이드)로 제공합니다.

## 3계층 동시 갱신

어떤 변경이든 다음 세 계층을 동시에 갱신해야 일관성이 깨지지 않습니다.

| 계층 | 위치 | 역할 |
|------|------|------|
| **운영 소스** | `index.html`, `assets/css/main.css`, `assets/js/main.js` | 실제 동작하는 셸과 로직 |
| **데이터** | `system.json`, `shops/{id}/info.json`, `posts/{slug}/post.json` | 시스템 메타데이터 + 업체/블로그 데이터 |
| **문서** | `README.md`, `AGENTS.md`, 본 파일 | 기여자/에이전트 가이드 |

## 업체 추가 절차

1. `shops/{id}/info.json` 작성 (필수: `id`, `name`, `region`)
2. `system.json.shops[]` 배열에 엔트리 추가
3. `system.json.counts.shops` 갱신
4. `node scripts/validate.mjs` 실행

## 블로그 글 추가 절차

1. `posts/{slug}/post.json` 작성 (필수: `id`, `title`, `date`, `blocks[]`)
2. `system.json.posts[]` 배열에 엔트리 추가
3. `system.json.counts.posts` 갱신
4. `node scripts/validate.mjs` 실행

## 컨벤션

### 파일 경로
- 단일 진입점: `index.html`
- 정적 자원: `assets/css/`, `assets/js/`
- 업체 데이터: `shops/{id}/` (id는 슬러그)
- 블로그 데이터: `posts/{slug}/` (slug는 슬러그)
- 스크립트: `scripts/` (ESM, Node 18+)

### 네이밍
- ID/슬러그: `^[a-z0-9][a-z0-9-]*$` (영소문자 시작, 영소문자/숫자/하이픈만)
- 날짜: ISO 8601 (`YYYY-MM-DD`)
- 색상: hex (`#RRGGBB` 또는 `#RRGGBBAA`)

### CSS 토큰
- Primitive: `--p-{family}-{step}` (예: `--p-neutral-100`)
- Semantic: `--sm-{role}-{variant}` (예: `--sm-content-primary`)

### JavaScript
- ES6+ vanilla, 외부 의존성 없음
- 단일 IIFE `(function(){ 'use strict'; ... })();`
- HTML 삽입 시 사용자 데이터는 반드시 `escapeHtml()` 적용

## 안전 / 보안
- 사용자 제공 텍스트는 모두 escape 후 렌더링.
- 외부 링크는 `target="_blank" rel="noopener noreferrer"` 적용.

## 검증

```bash
node scripts/validate.mjs
```

수정 시 예상되는 동작:
- `system.json` 등록과 실제 폴더가 어긋나면 error
- 폴더는 있는데 등록 안 됨 → warning
- 필수 필드 누락 → error

## 브라우저 호환
- 최신 evergreen (Chrome, Firefox, Safari, Edge)
- ES2018+ 문법 허용

## 기여 절차
1. 변경하려는 영역 식별 (소스/데이터/문서)
2. 위 3계층 중 영향받는 모든 계층을 같은 커밋으로 묶기
3. `scripts/validate.mjs` 통과 확인
4. `index.html`을 브라우저에서 열어 라이트/다크 + 모바일 토글 동작 확인
5. 커밋 메시지에 영향받은 계층 명시
