import express from 'express';
import cors from 'cors';
import meetingRoutes from './routes/meeting';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/meetings', meetingRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

export default app; 