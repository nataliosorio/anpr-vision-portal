export interface AuthData {
  userId: number;
  token: string;
  roles: string[];
  personId: number;
  rolesByParking: [number, string][];
}
