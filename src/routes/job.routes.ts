import { Router } from 'express';
import { jobController } from '../controllers/job.controller';
import { authenticate, checkRole } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { jobValidators } from '../middlewares/validators';

const router = Router();

// Public routes
router.get('/', validate(jobValidators.listJobs), jobController.list.bind(jobController));

// Protected routes - require authentication
router.use(authenticate);

// Get jobs posted by the current user
router.get('/my/listings', jobController.getMyJobs.bind(jobController));

// Public route for specific job
router.get('/:id', validate(jobValidators.jobId), jobController.getById.bind(jobController));

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