import { Profile } from "./user";

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

export interface PostWithStats {
  id: string;
  title: string;
  content: string;
  category: "자랑하기" | "고민상담";
  created_at: string;
  image_url: string | null;
  user_id: string;
  profiles: Profile | null;
  post_likes: { count: number }[]; // 또는 CountData
  comments: { count: number }[];
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  profiles: { nickname: string };
  comment_likes: { user_id: string }[];
}
