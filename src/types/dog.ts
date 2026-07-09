// types/dog.ts
export interface DogCardProps {
  dog: Dog;
}
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
  location_name: string;
  location_id: string;
}

export interface WriteFormData {
  title: string;
  people: string;
  hashtag: string;
  content: string;
  dog_size: string;
  deadline: string;
  status: string;
}

export interface CountData {
  count: number;
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
  nickname: string;
  avatar_url: string;
  bio?: string | null;
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
  x: string;
  y: string;
}

export interface KakaoPlaceResult {
  id: string;
  place_name: string;
  address_name: string;
}

export interface DogData {
  user_id: string;
  status: string;
}

export interface WalkingUser {
  user_id: string;
  nickname: string;
  avatar_url: string;
}

export interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: "자랑하기" | "고민상담";
  image_url: string | null;
  created_at: string;
  profiles?: Profile;
}

export type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  profiles: { nickname: string };
  comment_likes: { user_id: string }[];
};

export type PostWithStats = Post & {
  profiles: { nickname: string };
  post_likes: { count: number }[];
  comments: { count: number }[];
};
