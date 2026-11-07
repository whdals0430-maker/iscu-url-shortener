# ISCU URL Shortener 과제 프로젝트

Next.js + Neon PostgreSQL + Vercel 기반 URL 단축 서비스입니다.

## 구현 항목

- 메인 페이지 `GET /`
- URL 단축 `POST /api/shorten`
- URL 누락 시 `400` + `MISSING_URL`
- 잘못된 URL 및 javascript: URL 차단 (`400` + `INVALID_URL`)
- 동일한 원본 URL은 기존 shortCode 반환
- shortCode는 영문 대소문자/숫자 6자리
- 자기 서비스와 동일한 호스트의 URL 단축 차단 (경로와 HTTP/HTTPS 무관)
- 단축 URL `GET /{shortCode}` → `307` 리다이렉트
- 없는 코드 `404`
- Redirect 응답 `Cache-Control: no-store`
- Basic 인증으로 `/admin`, `/api/stats` 보호
- 클릭 수 및 마지막 클릭 시간 저장

## 1. 준비물

- GitHub 계정
- Vercel 계정
- Neon 계정
- 컴퓨터에 Node.js 20 이상 설치

## 2. Neon 데이터베이스 만들기

1. https://neon.tech 에 접속해 회원가입/로그인합니다.
2. 새 프로젝트를 만듭니다.
3. 대시보드에서 Connect 또는 Connection Details를 엽니다.
4. 연결 문자열(Postgres connection string)을 복사합니다.
5. 이 값은 `DATABASE_URL`로 사용합니다.

테이블은 첫 API 요청 때 자동 생성됩니다. 별도로 SQL을 실행할 필요가 없습니다.

## 3. 로컬에서 실행하기

프로젝트 폴더에서 터미널을 열고:

```bash
npm install
```

`.env.example`을 복사해 `.env.local` 파일을 만들고 값을 채웁니다.

```env
DATABASE_URL="Neon에서 복사한 연결 문자열"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="충분히_긴_나만의_비밀번호"
NEXT_PUBLIC_BASE_URL=""
```

그다음 실행합니다.

```bash
npm run dev
```

브라우저에서 http://localhost:3000 을 엽니다.

## 4. GitHub에 올리기

1. GitHub에서 새 Repository를 만듭니다.
2. 저장소 이름 예: `iscu-url-shortener`
3. 이 프로젝트 파일 전체를 저장소에 업로드합니다.
4. `.env.local`은 절대 업로드하지 않습니다. `.gitignore`에 제외되어 있습니다.

Git 명령어를 사용하는 경우:

```bash
git init
git add .
git commit -m "Complete URL shortener assignment"
git branch -M main
git remote add origin https://github.com/본인아이디/iscu-url-shortener.git
git push -u origin main
```

## 5. Vercel 배포

1. https://vercel.com 에서 GitHub 계정으로 로그인합니다.
2. Add New → Project를 선택합니다.
3. 방금 만든 GitHub 저장소를 Import 합니다.
4. Environment Variables에 아래 3개를 등록합니다.

| 이름 | 값 |
|---|---|
| `DATABASE_URL` | Neon 연결 문자열 |
| `ADMIN_USERNAME` | 관리자 아이디 |
| `ADMIN_PASSWORD` | 관리자 비밀번호 |

5. Deploy를 누릅니다.
6. 배포가 끝나면 `https://프로젝트이름.vercel.app` 주소를 확인합니다.

환경변수를 배포 후 수정했다면 반드시 Redeploy 해야 적용됩니다.

## 6. 테스트

메인 페이지 접속:

```text
https://본인프로젝트.vercel.app
```

URL 단축 API 예시:

```bash
curl -X POST https://본인프로젝트.vercel.app/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl":"https://example.com"}'
```

같은 요청을 한 번 더 보내면 같은 `shortCode`가 반환되어야 합니다.

관리자 페이지:

```text
https://본인프로젝트.vercel.app/admin
```

브라우저가 Basic 인증 창을 띄우면 `ADMIN_USERNAME`, `ADMIN_PASSWORD`를 입력합니다.

## 7. 자동 채점

교수님이 제공한 `iscu_url_shortener_check.py` 파일을 프로젝트 폴더 또는 별도 폴더에 저장합니다.

```bash
python -m pip install requests
python iscu_url_shortener_check.py --url https://본인프로젝트.vercel.app
```

Rate Limit이나 일시적 네트워크 문제로 REVIEW가 나오면 안내에 따라 간격을 늘려 재검사합니다.

## 주의사항

- `.env.local`, DB 연결 문자열, 관리자 비밀번호를 GitHub에 올리지 마세요.
- 제출에는 Vercel의 Production URL을 사용하세요.
- 제출 마감 후에는 교수자 채점 완료 전까지 수정/재배포하지 마세요.
- Vercel Firewall의 Rate Limiting 설정은 Vercel 대시보드에서 별도로 확인하세요. 자동 채점 스크립트의 11개 항목에는 Rate Limit 자체 검사가 포함되어 있지 않습니다.
- 실제 제출 전 반드시 제공된 자동 채점 스크립트로 확인하세요.
