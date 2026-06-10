// types/dog.ts
export interface Dog {
  id: number;
  title: string;
  user_id: string;
  content: string; // 폼 데이터
  image_url: string; // 이미지 URL
  people: number; // 참여 인원
  hashtags: string[]; // 해시태그 배열
  created_at: string; // 생성일
}

// 폼 입력용 데이터 구조
export interface WriteFormData {
  title: string;
  content: string;
  people: string; // 폼에서 선택된 값은 string으로 들어옴
  hashtag: string; // 콤마로 구분된 문자열
}
