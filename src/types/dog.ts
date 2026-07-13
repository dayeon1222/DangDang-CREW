export interface Dog {
  id: number;
  title: string;
  user_id: string;
  content: string;
  image_url: string;
  people: number;
  created_at: string;
  deadline: string;
  status: "모집중" | "마감" | "완료";
  dog_size: string;
  location_name: string;
  location_id: string;
}

export interface DogCardProps {
  dog: Dog;
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

export interface DogData {
  user_id: string;
  status: string;
}

export interface WalkingUser {
  user_id: string;
  nickname: string;
  avatar_url: string;
}
