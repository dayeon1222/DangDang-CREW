# 댕댕크루 (DangDang Crew)

**"우리 동네 댕댕이들과 함께하는 즐거운 산책 라이프"**

강형욱 훈련사님께서 나오시는 프로그램을 보고 반려견들도 사회성이 필요하겠구나 싶어서 주변 산책 모임을 찾는 반응형 웹을 만들게 됐습니다.

댕댕크루는 반려견과 함께할 산책 친구를 찾고, 우리 동네 산책 모임을 쉽고 빠르게 만들 수 있는 커뮤니티 플랫폼입니다. 위치 기반 서비스를 통해 내 주변의 강아지 친구들을 만나고 소중한 산책 기록을 공유할 수 있습니다. 나의 반려견의 고민거리와 자랑거리를 올려실 수 있습니다.

## 주요 기능

- **주변 산책 모임 찾기**: 현재 위치 기반으로 주변 공원과 진행 중인 산책 모임 조회
- **간편 모임 개설**: 강아지 사진, 산책 시간, 인원 등을 설정하여 나만의 산책 친구 모집
- **반응형 산책 기록**: 모바일과 데스크탑에서 모두 쾌적한 카드 형태의 게시글 열람
- **필터링 시스템**: 강아지 크기별로 원하는 산책 친구를 빠르게 탐색
- **AI 기능**: 캘린더에 ai가 추가하는 기능

## Tech Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **State Management**: React Hooks (Controlled Components)

### Backend & Database

- **Database**: Supabase
- **Authentication**: Supabase Auth (이메일 회원가입/로그인)
- **Storage**: Supabase Storage (강아지 프로필 및 모임 사진 관리)

### API & Tools

- **Maps**: Kakao Maps API (주변 공원 검색)
- **Icons**: Lucide React
- **Date/Time**: date-fns (산책 시간 및 생성 시간 포맷팅)

### 수정 예정

- 모바일 - 로그인/로그아웃 버튼, 헤더부분, 지도부분
- 산책후기 - 없으면 남길 사람 없음
- 로그인을 하지 않을시 어떻게 할지
- 최적화

### Trouble Shooting

1. API 호출 방식의 모델 미지원 문제 (404 Not Found)
   문제: 최신 모델(gemini-1.5-flash)을 호출하는 과정에서 API 버전 및 모델 경로 호환성 문제로 404 에러 발생.

해결: 서버 터미널 로그를 분석하여 모델 호출 경로를 파악하고, 서비스 환경에서 안정적인 gemini-pro 모델로 교체 및 호출 방식(모델명 설정)을 수정하여 연동 성공.

2. 시간 데이터 결합(Date-Time Coupling) 오류
   문제: DB에서 가져온 timeInfo가 단순히 시간(HH:mm:ss)만 담고 있어, AI가 날짜 정보를 처리하지 못하고 캘린더 등록 로직이 실패함.

해결: AI의 추론에만 의존하지 않고, 서버 코드에서 현재 날짜를 직접 계산하여 프롬프트에 주입하는 날짜-시간 결합 방식을 설계. 특히 timeInfo가 없는 경우 기본값(19:00:00)을 할당하는 분기 로직을 추가하여 데이터 무결성 확보.

3. 서버 내부 에러(500)가 클라이언트 중단으로 이어지는 문제
   문제: 서버에서 API 응답 오류(500) 발생 시 프론트엔드(CalendarButton)가 예외 처리 없이 throw new Error를 던져 앱 전체의 로직이 중단됨.

해결:

Fallback 전략 수립: 서버 API에서 에러 발생 시 500 대신 기본값 JSON을 응답하도록 수정하여 클라이언트가 에러를 받더라도 유연하게 대응하게 함.

클라이언트 비동기 최적화: res.ok 조건뿐만 아니라 데이터 존재 여부를 체크하도록 로직을 변경하여, 서버 장애 상황에서도 서비스가 멈추지 않고 사용자에게 안내 메시지를 띄우는 방식으로 개선.

4. JSON 파싱 실패 및 불필요한 AI 출력 정제
   문제: AI가 JSON 형식이 아닌 서술형 답변을 덧붙이거나 마크다운 문법을 사용하여 JSON.parse 단계에서 구문 오류 발생.

해결: 정규식(match(/\{[\s\S]\*\}/))을 사용하여 응답 텍스트 내에서 JSON 객체 부분만 정확히 추출하는 파싱 로직을 직접 구현하고, 마크다운 기호를 제거하는 전처리 로직을 추가하여 파싱 성공률 100% 달성.

5. TanStack Query 사용 시 "No QueryClient set" 에러

문제 상황 (Problem)
증상: useQuery를 사용하는 페이지(MapPage)에서 Runtime Error: No QueryClient set, use QueryClientProvider to set one 메시지가 발생하며 화면이 렌더링되지 않음.

원인: TanStack Query는 데이터를 캐싱하고 상태를 관리하기 위해 QueryClient 인스턴스가 필요한데, 애플리케이션 최상위 컴포넌트에서 QueryClientProvider로 감싸져 있지 않아 하위 컴포넌트들이 QueryClient를 찾지 못함.

원인 분석 (Root Cause)
React Context 활용: TanStack Query는 내부적으로 React Context API를 사용하여 데이터를 공유함. 프로바이더가 없으면 Context를 사용할 수 없음.

서버/클라이언트 컴포넌트 분리: Next.js App Router 환경에서 layout.tsx는 기본적으로 서버 컴포넌트임. 그러나 QueryClientProvider는 use client 선언이 필요한 클라이언트 컴포넌트에서만 동작함. 따라서 서버 컴포넌트인 레이아웃에서 바로 사용할 수 없고, 별도의 클라이언트 컴포넌트로 분리해야 함.

해결 방법 (Solution)
Step 1: 프로바이더 컴포넌트 생성 (providers.tsx)

클라이언트 컴포넌트로 선언하고, useState를 사용하여 QueryClient 인스턴스를 최초 1회만 안전하게 생성하여 QueryClientProvider에 전달함.
Step 2: 레이아웃 적용 (layout.tsx)

생성된 Providers 컴포넌트를 RootLayout의 body 내부에 배치하여 전체 애플리케이션에 TanStack Query 환경을 주입함.
