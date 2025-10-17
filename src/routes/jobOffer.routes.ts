import express from 'express';
import { param } from 'express-validator';
import { jobOfferController } from '../controllers/jobOffer.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { jobOfferValidators } from '../middlewares/validators/jobOffer.validators';
import { cacheMiddleware } from '../middlewares/cache.middleware';

const router = express.Router();

// Protected routes - require authentication
router.use(authenticate);

// Get job offers for logged-in user
router.get('/',
  cacheMiddleware({ ttl: 300, keyPrefix: 'jobOffers', includeUserId: true }),
  jobOfferController.getMyJobOffers
);

// Get specific job offer details
router.get(
  '/:id',
  validate(jobOfferValidators.jobOfferId),
  cacheMiddleware({ ttl: 600, keyPrefix: 'jobOffers:detail' }),
  jobOfferController.getJobOffer
);

// Accept a job offer (candidate only)
router.post(
  '/:id/accept',
  validate(jobOfferValidators.jobOfferId),
  jobOfferController.acceptJobOffer
);

// Reject a job offer (candidate only)
router.post(
  '/:id/reject',
  validate(jobOfferValidators.rejectJobOffer),
  jobOfferController.rejectJobOffer
);

// Withdraw a job offer (employer only)
router.post(
  '/:id/withdraw',
  validate(jobOfferValidators.withdrawJobOffer),
  jobOfferController.withdrawJobOffer
);

// Create a job offer for an application
router.post(
  '/application/:applicationId',
  validate([
    ...jobOfferValidators.createJobOffer,
    ...jobOfferValidators.applicationId
  ]),
  jobOfferController.createJobOffer
);

// Get job offers for a specific application
router.get(
  '/application/:applicationId',
  validate(jobOfferValidators.applicationId),
  cacheMiddleware({ ttl: 300, keyPrefix: 'jobOffers:application' }),
  jobOfferController.getApplicationJobOffers
);

export const jobOfferRoutes = router;