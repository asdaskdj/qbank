# 뷰티풀매스 문제은행

김병진 수학연구소 문제은행 구조를 참고해 만든 나만의 수학 문제은행·학습지 생성 사이트입니다.

## 화면
- **로그인** — 데모 모드에서는 아무 이메일로 입장. Supabase 키 설정 시 진짜 로그인.
- **학습지 만들기 (3단계 마법사)**
  - STEP 1 범위 선택: 단원·유형별 / 학교별 기출 / 모의고사(학평)
  - STEP 2 상세 편집: 문제 통계·순서 변경·새 문제 추가·쌍둥이/유사, 긴 문제는 ▥ 버튼으로 한 단 통째 사용
  - STEP 3 구성 설정: 학습지명·출제자·태그·색상·머리 모양 + 실시간 미리보기
  - 인쇄: 2단, 단당 2문제(긴 문제는 1문제), 풀이 여백, 빠른 정답 + 해설 페이지. 브라우저 인쇄에서 PDF 저장.
- **문항 등록/관리** — GPT 변환 지침 복사 → 사진을 GPT로 JSON 변환 → 붙여넣기 대량 등록 (needimg 그림 표시 지원)
- **내신대비** — 학생 관리, 학습지별 오답 체크, 누적 오답 모아보기, 오답 재시험지 생성

## 실행
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ — Vercel/Cloudflare Pages/Netlify에 그대로 배포
```

## 진짜 로그인 켜기 (Supabase, 무료)
1. supabase.com 에서 프로젝트 생성
2. SQL Editor에 `supabase.sql` 내용 실행
3. Authentication → Users 에서 선생님 계정 추가
4. `.env.example`을 `.env`로 복사하고 프로젝트의 URL·anon key 입력
5. 다시 빌드/배포 — 로그인 화면이 자동으로 실계정 인증으로 바뀝니다

데이터는 현재 브라우저 localStorage에 저장됩니다. Supabase `user_state` 테이블 동기화는
`src/store/StoreProvider.tsx`의 load/save 지점에 붙이도록 준비되어 있습니다.

## 구조
- `src/data/curriculum.ts` — 교육과정 트리 (과목·단원·유형). 여기만 고치면 트리가 바뀝니다.
- `src/data/seed.ts` — 예시 문항 27개 (경기고·경기여고·낙생고·수성고·경신고 기출 + 고1 학평)
- `src/lib/paper.ts` — 시험지 배치 규칙 (단당 2문제, 긴 문제 자동 감지)
- `src/components/Paper.tsx` — A4 시험지 렌더러 (수학 영역형 / 제목 바형 머리)
- `src/pages/` — Step1~3, PrintPaper, Problems(등록), Naesin(내신대비), Login

## 초기화
브라우저 콘솔에서 `localStorage.removeItem('qbank:v1')` 후 새로고침하면 예시 데이터로 돌아갑니다.
