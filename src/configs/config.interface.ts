export interface Config {
  nest: NestConfig;
  cors: CorsConfig;
  throttler: ThrottlerConfig;
  graphql: GraphqlConfig;
  security: SecurityConfig;
  email: SmtpConfig;
  storage: StorageConfig;
}

export interface NestConfig {
  port: number;
}

export interface CorsConfig {
  enabled: boolean;
}

export interface ThrottlerConfig {
  ttl: number;
  limit: number;
}

export interface GraphqlConfig {
  playgroundEnabled: boolean;
  debug: boolean;
  sortSchema: boolean;
}

export interface SecurityConfig {
  expiresIn: string;
  refreshIn: string;
  confirmIn: string;
  passwordIn: string;
  bcryptSaltOrRound: string | number;
}

export interface SmtpConfig {
  from: string;
  replyTo: string;
}

export interface StorageConfig {
  maxSize: string;
}
