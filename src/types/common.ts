export interface CountData {
  count: number;
}

export interface ToolBarProps {
  onFilterChange: (size: string) => void;
  selectedSize: string;
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
