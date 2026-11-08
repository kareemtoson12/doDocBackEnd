import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import doctorRoutes from './routes/doctors.routes';
import specializationRoutes from './routes/specializations.routes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get(['/health', '/api/v1/health'], (req: Request, res: Response) => {
  res.json({ status: 'success', message: 'Docdoc API is running' });
});

// Root welcome endpoint for direct testing in browser
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'Welcome to Docdoc Telemedicine API',
    endpoints: {
      health: '/api/v1/health',
      doctors: '/api/v1/doctors',
      recommended_doctors: '/api/v1/doctors/recommended',
      specializations: '/api/v1/specializations',
      auth: {
        register: 'POST /api/v1/auth/register',
        login: 'POST /api/v1/auth/login',
        forgot_password: 'POST /api/v1/auth/forgot-password',
        profile: 'GET /api/v1/auth/me',
      },
    },
  });
});

// Mount the routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/specializations', specializationRoutes);

// 404 Handler for undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    code: 'NOT_FOUND',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Global Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    code: err.code || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An internal server error occurred',
  });
});

export default app;
