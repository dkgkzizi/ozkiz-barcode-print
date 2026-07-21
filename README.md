# 모바일 바코드 출력

PC와 모바일이 같은 웹 주소에서 함께 쓰는 바코드 스티커 출력 도구입니다. Vercel에 배포되어 있어 같은 와이파이가 아니어도(LTE 등) 어디서든 접속할 수 있습니다.

## 로컬 개발

```bash
cd "모바일 바코드 출력"
npm install
cp .env.example .env   # SUPABASE_CONNECTION_STRING 값을 실제 값으로 채워넣기
npm run setup-db       # print_jobs / print_logs 테이블 최초 1회 생성
npm run dev            # vercel dev로 로컬 실행 (http://localhost:3000)
```

## 배포 (Vercel)

1. 이 저장소를 GitHub에 push
2. [vercel.com](https://vercel.com)에서 New Project → 저장소 import
3. 프로젝트 Settings → Environment Variables에 `SUPABASE_CONNECTION_STRING` 추가
4. Deploy

## 구성

- `public/index.html` — PC/모바일 공통 웹 화면 (우측 상단에서 PC 버전 / 모바일 버전 전환 가능)
- `api/products.js` — Supabase 상품 검색 (상품명만 검색하면 전체 옵션, 상품명+색상+사이즈로 검색하면 해당 옵션만)
- `api/jobs/*` — 출력 대기열 (Supabase `print_jobs` 테이블)
- `api/logs.js` — 출력 로그 (Supabase `print_logs` 테이블)
- 출력은 브라우저 인쇄 다이얼로그를 사용하며, 80mm x 40mm 라벨 크기로 맞춰져 있습니다.

## 다음 확장

- Bluetooth LE
- 프린터 로컬 에이전트(QZ Tray 등) 연동으로 인쇄 다이얼로그 없이 바로 출력
