import { Router } from 'express';
import { jobController } from '../controllers/job.controller';
import { authenticate, checkRole } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { jobValidators } from '../middlewares/validators';
import { cacheMiddleware } from '../middlewares/cache.middleware';

const router = Router();

// Public routes with caching
router.get('/', 
  validate(jobValidators.listJobs), 
  cacheMiddleware({ ttl: 300, keyPrefix: 'jobs:list' }), 
  jobController.list.bind(jobController)
);

// Public route for specific job with caching
router.get('/:id', 
  cacheMiddleware({ ttl: 600, keyPrefix: 'jobs:detail' }), 
  jobController.getById.bind(jobController)
);

// Protected routes - require authentication
router.use(authenticate);

// Get jobs posted by the current user with caching
router.get('/my/listings', 
  cacheMiddleware({ ttl: 600, keyPrefix: 'jobs', includeUserId: true }), 
  jobController.getMyJobs.bind(jobController)
);

// Only employers and admins can create jobs
router.post(
  '/',
  checkRole(['EMPLOYER', 'ADMIN']),
  validate(jobValidators.createJob),
  jobController.create.bind(jobController)
);

// Update and delete routes require job ownership verification in controller
router.patch(
  '/:id',
  validate([...jobValidators.jobId, ...jobValidators.updateJob]),
  jobController.update.bind(jobController)
);

router.delete(
  '/:id',
  validate(jobValidators.jobId),
  jobController.delete.bind(jobController)
);

export default router;