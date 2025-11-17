import { Router, Request, Response } from 'express';
import redis from '../../config/redis.config';
import { transcriptionQueue } from '../../config/queue.config';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    // Check Redis connection
    await redis.ping();

    // Check queue
    const waiting = await transcriptionQueue.getWaitingCount();
    const active = await transcriptionQueue.getActiveCount();
    const completed = await transcriptionQueue.getCompletedCount();
    const failed = await transcriptionQueue.getFailedCount();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        redis: 'connected',
        queue: 'operational',
      },
      queue: {
        waiting,
        active,
        completed,
        failed,
      },
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

export default router;
