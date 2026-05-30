import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { apiLimiter } from './middleware/rateLimiter.middleware';

const app = express();

// Programmatically guarantee uploads folder exists for avatar files
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('[Setup] Created local uploads directory for user profile avatars');
}

// 1. Safety Middlewares
app.use(helmet()); // Set protective HTTP response headers
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse incoming JSON payloads
app.use(express.urlencoded({ extended: true }));

// 2. Global Safety Rate Limiter
app.use('/api', apiLimiter);

// 3. Static Media exposure for profile images
app.use('/uploads', express.static(uploadDir));

// 4. Bind Healthcheck route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MuscleIQ Core API is healthy and operational',
    timestamp: new Date(),
  });
});

// 5. Connect Versioned API Modules
app.use('/api/v1', routes);

// 6. Centralized Error Boundary Middleware
app.use(errorHandler);

export default app;
