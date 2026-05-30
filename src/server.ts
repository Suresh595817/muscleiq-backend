import app from './app';
import dotenv from 'dotenv';

// Load environmental variables
dotenv.config();

const PORT = parseInt(process.env.PORT ?? "5000", 10);

const startServer = async () => {
// 1. Supabase client is initialized in db.ts

  // 2. Start Express Listening Server
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `[Server] MuscleIQ Backend running in ${
        process.env.NODE_ENV || 'development'
      } mode on http://0.0.0.0:${PORT}`
    );
  });

  // Handle unhandled promise rejections safely
  process.on('unhandledRejection', (err: Error) => {
    console.error(`[Server Fatal] Unhandled Promise Rejection: ${err.message}`);
    // Graceful close of connection and express
    server.close(() => process.exit(1));
  });
};

startServer();
