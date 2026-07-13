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
