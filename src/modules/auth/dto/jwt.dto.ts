import { Operations } from '../enum/operations.enum';

export interface JwtDto {
  userId: string;
  operation: Operations;
  iat: number;
  exp: number;
}
