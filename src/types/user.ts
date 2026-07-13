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

export type ReviewData = {
  rating: number;
  content: string;
};

export interface Participant {
  user_id: string;
  profiles: { nickname: string } | null;
}
