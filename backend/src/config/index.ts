import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'somlance_secret_key',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'somlance_refresh_secret_key',
  databaseUrl: process.env.DATABASE_URL,
  env: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
};
