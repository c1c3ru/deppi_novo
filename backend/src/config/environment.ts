// Environment Configuration – PRODUCTION security hardening
import * as dotenv from 'dotenv';
import path from 'path';

// Carrega o .env localizado na raiz do projeto (dois níveis acima de src/config)
dotenv.config({ path: path.join(__dirname, '../../../.env') });

// Helper: lança erro em produção se variável crítica não estiver definida
function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] || fallback;
  if (!value && process.env.NODE_ENV === 'production') {
    throw new Error(`[ENV] Missing required environment variable: ${key}`);
  }
  return value ?? '';
}

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),

  database: {
    host: requireEnv('DB_HOST', 'localhost'),
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: requireEnv('DB_NAME', 'deppi'),
    user: requireEnv('DB_USER', 'deppi'),
    password: requireEnv('DB_PASSWORD', 'password'),
    ssl: process.env.DB_SSL === 'true',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  jwt: {
    // Sem fallback inseguro em produção
    secret: requireEnv(
      'JWT_SECRET',
      process.env.NODE_ENV !== 'production'
        ? 'dev-only-insecure-jwt-secret'
        : ''
    ),
    refreshSecret: requireEnv(
      'JWT_REFRESH_SECRET',
      process.env.NODE_ENV !== 'production'
        ? 'dev-only-insecure-refresh-secret'
        : ''
    ),
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  cors: {
    allowedOrigins: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:4200',
    ],
  },

  sentry: {
    dsn: process.env.SENTRY_DSN || null,
  },

  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@deppi.ifce.edu.br',
    fromName: process.env.EMAIL_FROM_NAME || 'DEPPI IFCE Maracanaú',
  },
};
