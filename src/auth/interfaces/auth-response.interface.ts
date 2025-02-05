import { User } from './user.interface';

export interface AuthResponse {
  id_token: string;
  expires_in: number;
  token_type: string;
  user?: User;
}
