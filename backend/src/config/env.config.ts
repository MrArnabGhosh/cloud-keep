import { getEnv } from '../utils/get-env';

const envConfig = () => ({
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  PORT: getEnv('PORT', '3000'),

  BASE_PATH: getEnv('BASE_PATH', '/api'),
  MONGO_URI: getEnv('MONGO_URI', ''),

  JWT_SECRET: getEnv('JWT_SECRET', 'secert_jwt'),
  JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN', '7d'),

  LOG_LEVEL: getEnv('LOG_LEVEL', 'info'),

  ALLOWED_ORIGINS: getEnv(
    'ALLOWED_ORIGINS',
    // 'https://uploadnest-alpha.vercel.app',
  ),

});

export const Env = envConfig();