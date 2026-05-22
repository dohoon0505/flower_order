# 꽃배달 직배송 · 신선한 꽃을 산지에서 바로

> 농장에서 당일 수확한 꽃을 중간 유통 없이 직접 배송합니다.
> **현재 버전 v1.0.0**

---

## 이 프로젝트는

꽃다발, 꽃바구니, 화환, 관엽식물 등 다양한 꽃 상품을 산지 직배송으로 전국에 배송하는 플랫폼입니다.

| 대상 | 진입점 | 특징 |
| --- | --- | --- |
| 사람 | `index.html` | 브라우저에서 열면 바로 꽃배달 플랫폼 |
| AI 에이전트 | [`AGENTS.md`](AGENTS.md) + [`system.json`](system.json) | 1–2 파일 read로 모든 쿼리 해결 |
| 기여자 | [`CLAUDE.md`](CLAUDE.md) | 3계층 작업 원칙 · 수정 워크플로 |

---

## 빠른 시작

```bash
start index.html         # Windows
open index.html          # macOS
```

외부 서버 불필요. 이 한 파일이 전체 사이트.

---

## 상품 카테고리

| 카테고리 | 설명 |
|----------|------|
| 생화 꽃다발 | 시즌 생화로 만든 프리미엄 꽃다발 |
| 꽃바구니 | 생일, 기념일, 축하 선물용 꽃바구니 |
| 화환·근조 | 개업 축하, 근조 화환 전국 배송 |
| 관엽식물 | 공기 정화 식물, 인테리어 화분 |
| 특별 기획 | 시즌 한정, 프로포즈, 정기 구독 |

---

## 폴더 구조

```
flower_order/
├── index.html                  ← 운영 진본
├── assets/
│   ├── css/main.css
│   └── js/main.js
│
├── system.json                 ← 루트 매니페스트
├── scripts/validate.mjs        ← 무결성 검증
├── AGENTS.md                   ← AI 에이전트 진입점
├── CLAUDE.md                   ← 기여 가이드라인
└── README.md                   ← 이 파일
```

---

## 기여

1. [CLAUDE.md](CLAUDE.md) 의 3계층 작업 원칙 준수
2. 수정 후 `node scripts/validate.mjs` 실행
3. `index.html`을 브라우저에서 열어 라이트/다크 모드 확인

---

## 라이선스

운영 관리: **/DH** · 2026 · MIT
