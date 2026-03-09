import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { config } from './config/environment';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/notFound.middleware';
import { authMiddleware } from './middleware/auth.middleware';
import { validationMiddleware } from './middleware/validation.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import boletimRoutes from './routes/boletim.routes';
import uploadRoutes from './routes/upload.routes';
import healthRoutes from './routes/health.routes';
import contactRoutes from './routes/contact.routes';

// Sentry
import * as Sentry from '@sentry/node';

// Inicialização do Sentry
if (config.sentry.dsn) {
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.nodeEnv,
    tracesSampleRate: 1.0,
  });
}

class Application {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeSwagger();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Trust proxy FIRST so rate limiters work behind nginx/Cloudflare
    this.app.set('trust proxy', 1);

    // Remove X-Powered-By header
    this.app.disable('x-powered-by');

    // Security
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'"],
        },
      },
    }));

    // CORS
    this.app.use(cors({
      origin: config.cors.allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    // Compression
    this.app.use(compression());

    // Body parsing – keep limit small; upload routes use multipart not JSON
    this.app.use(express.json({ limit: '2mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '2mb' }));

    // Logging
    if (config.nodeEnv !== 'test') {
      this.app.use(morgan('combined', {
        stream: { write: message => logger.info(message.trim()) }
      }));
    }

    // Global rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: config.nodeEnv === 'production' ? 200 : 2000,
      message: { error: 'Too many requests from this IP, please try again later.' },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);
  }

  private initializeRoutes(): void {
    // Health check
    this.app.use('/health', healthRoutes);

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', authMiddleware, userRoutes);
    this.app.use('/api/boletins', boletimRoutes);
    this.app.use('/api/upload', authMiddleware, uploadRoutes);
    this.app.use('/api/contact', contactRoutes);

    // API status routes
    this.app.get('/api', (req, res) => {
      res.json({
        status: 'UP',
        message: 'DEPPI API Gateway',
        version: '1.0.0',
        docs: `http://localhost:${config.port}/api-docs`
      });
    });

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        message: 'DEPPI API - IFCE Campus Maracanaú',
        version: '1.0.0',
        environment: config.nodeEnv,
        timestamp: new Date().toISOString(),
      });
    });
  }

  private initializeSwagger(): void {
    if (config.nodeEnv !== 'production') {
      const options = {
        definition: {
          openapi: '3.0.0',
          info: {
            title: 'DEPPI API',
            version: '1.0.0',
            description: 'API para o sistema DEPPI do IFCE Campus Maracanaú',
            contact: {
              name: 'DEPPI Team',
              email: 'deppi.maracanau@ifce.edu.br',
            },
          },
          servers: [
            {
              url: `http://localhost:${config.port}`,
              description: 'Development server',
            },
            {
              url: 'https://api.deppi.ifce.edu.br',
              description: 'Production server',
            },
          ],
          components: {
            securitySchemes: {
              bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
              },
            },
          },
          security: [
            {
              bearerAuth: [],
            },
          ],
        },
        apis: ['./src/routes/*.ts', './src/models/*.ts'],
      };

      const specs = swaggerJsdoc(options);
      this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
    }
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Error handler (must be last)
    this.app.use(errorHandler);
  }

  public listen(): void {
    this.app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port} in ${config.nodeEnv} mode`);

      if (config.nodeEnv !== 'production') {
        logger.info(`📚 Swagger docs available at http://localhost:${config.port}/api-docs`);
      }
    });
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start application
const application = new Application();
application.listen();

export default application.app;
