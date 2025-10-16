import { Router } from 'express';
import { applicationController } from '../controllers/application.controller';
import { authenticate, checkRole } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { applicationValidators } from '../middlewares/validators';

const router = Router();

router.use(authenticate);

// Private - CANDIDATE only
router.post(
  '/jobs/:id/apply',
  checkRole(['CANDIDATE']),
  validate(applicationValidators.applyToJob),
  applicationController.applyToJob
);


// Private - EMPLOYER only (who posted the job)
router.get(
  '/jobs/:id/applications',
  checkRole(['EMPLOYER', 'ADMIN']), // ADMIN can also access all applications
  validate(applicationValidators.getJobApplications),
  applicationController.getJobApplications
);

// Private - EMPLOYER (who posted the job) or CANDIDATE (who applied)
router.get(
  '/applications/:id',
  validate(applicationValidators.getApplicationDetails),
  applicationController.getApplicationDetails
);


// Private - EMPLOYER only (who posted the job)
router.get(
  '/jobs/:id/export',
  checkRole(['EMPLOYER', 'ADMIN']), // ADMIN can also export applications
  validate(applicationValidators.exportJobApplications),
  applicationController.exportJobApplications
);

export const applicationRoutes = router;