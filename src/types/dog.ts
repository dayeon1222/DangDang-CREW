// types/dog.ts
export interface Dog {
  id: number;
  title: string;
  user_id: string;
  content: string;
  image_url: string;
  people: number;
  hashtags: string[];
  created_at: string;
  deadline: string;
  status: "모집중" | "마감" | "완료";
  dog_size: string;
}

// 폼 입력 시 사용할 데이터
export interface WriteFormData {
  title: string;
  people: string;
  hashtag: string;
  content: string;
  dog_size: string;
  deadline: string;
  status: string;
}

export interface Participant {
  user_id: string;
  profiles: { nickname: string } | null;
}

export type ReviewData = {
  rating: number;
  content: string;
};

export interface Profile {
  id: string;
  nickname: string | null;
  bio: string | null;
  avatar_url?: string | null;
  favorite_park_id: string | null;
}

export interface Review {
  id: string;
  rating: number;
  content: string;
  profiles: { nickname: string | null } | { nickname: string | null }[] | null;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface ParkPlace {
  id: string;
  place_name: string;
  x: string; // 경도(longitude)
  y: string; // 위도(latitude)
}

export interface KakaoPlaceResult {
  id: string;
  place_name: string;
  address_name: string;
}
