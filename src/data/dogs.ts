// 나중에 백엔드에서 올 데이터의 모양을 미리 정의합니다.
// 강아지 데이터의 모양(Type)을 정의
export interface Dog {
  id: number;
  name: string;
  breed: string;
  size: "소형견" | "중형견" | "대형견";
  age: number;
  location: string;
  imageUrl: string;
}

export const MOCK_DOGS = [
  {
    id: 1,
    name: "초코",
    breed: "푸들",
    size: "소형견",
    age: 3,
    location: "서울 강남구",
    imageUrl: "https://example.com/dog1.jpg",
  },
  {
    id: 2,
    name: "댕이",
    breed: "리트리버",
    size: "대형견",
    age: 1,
    location: "서울 서초구",
    imageUrl: "https://example.com/dog2.jpg",
  },
];
