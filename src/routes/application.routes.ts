import { Router } from 'express';
import { applicationController } from '../controllers/application.controller';
import { authenticate, checkRole } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { applicationValidators } from '../middlewares/validators';

const router = Router();

/**
 * @route POST /jobs/:id/apply
 * @desc Apply to a job
 * @access Private - CANDIDATE only
 */
router.post(
  '/jobs/:id/apply',
  authenticate,
  checkRole(['CANDIDATE']),
  validate(applicationValidators.applyToJob),
  applicationController.applyToJob
);

/**
 * @route GET /jobs/:id/applications
 * @desc Get all applications for a job
 * @access Private - EMPLOYER only (who posted the job)
 */
router.get(
  '/jobs/:id/applications',
  authenticate,
  checkRole(['EMPLOYER', 'ADMIN']), // ADMIN can also access all applications
  validate(applicationValidators.getJobApplications),
  applicationController.getJobApplications
);

/**
 * @route GET /applications/:id
 * @desc Get application details
 * @access Private - EMPLOYER (who posted the job) or CANDIDATE (who applied)
 */
router.get(
  '/applications/:id',
  authenticate,
  validate(applicationValidators.getApplicationDetails),
  applicationController.getApplicationDetails
);

/**
 * @route GET /jobs/:id/export
 * @desc Export job applications as CSV
 * @access Private - EMPLOYER only (who posted the job)
 */
router.get(
  '/jobs/:id/export',
  authenticate,
  checkRole(['EMPLOYER', 'ADMIN']), // ADMIN can also export applications
  validate(applicationValidators.exportJobApplications),
  applicationController.exportJobApplications
);

export const applicationRoutes = router;