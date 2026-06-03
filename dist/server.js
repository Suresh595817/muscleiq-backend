"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environmental variables
dotenv_1.default.config();
const PORT = parseInt(process.env.PORT ?? "5000", 10);
const startServer = async () => {
    // 1. Supabase client is initialized in db.ts
    // 2. Start Express Listening Server
    const server = app_1.default.listen(PORT, '0.0.0.0', () => {
        console.log(`[Server] MuscleIQ Backend running in ${process.env.NODE_ENV || 'development'} mode on http://0.0.0.0:${PORT}`);
    });
    // Handle unhandled promise rejections safely
    process.on('unhandledRejection', (err) => {
        console.error(`[Server Fatal] Unhandled Promise Rejection: ${err.message}`);
        // Graceful close of connection and express
        server.close(() => process.exit(1));
    });
};
startServer();
