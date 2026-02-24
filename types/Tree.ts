export interface Tree {
  id: string;
  species: string;
  latitude: number;
  longitude: number;
  healthStatus: "Healthy" | "Moderate" | "Critical";
  age?: number;
  height?: number;
}
