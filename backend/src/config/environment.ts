import * as dotenv from 'dotenv';
import path from 'path';

// Carrega o .env localizado na raiz do projeto (dois níveis acima de src/config)
dotenv.config({ path: path.join(__dirname, '../../../.env') });

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'deppi',
    user: process.env.DB_USER || 'deppi',
    password: process.env.DB_PASSWORD || 'password',
    ssl: process.env.DB_SSL === 'true'
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  cors: {
    allowedOrigins: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:4200']
  },
  sentry: {
    dsn: process.env.SENTRY_DSN || null
  }
};
