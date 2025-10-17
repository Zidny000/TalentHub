/**
 * @swagger
 * components:
 *   schemas:
 *     JobOffer:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The unique identifier for the job offer
 *         title:
 *           type: string
 *           description: Job title for the offer
 *         description:
 *           type: string
 *           description: Detailed description of the job offer
 *         salary:
 *           type: number
 *           description: Offered salary
 *         benefits:
 *           type: string
 *           description: Job benefits
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Expected start date
 *         expirationDate:
 *           type: string
 *           format: date-time
 *           description: Expiration date of the offer
 *         status:
 *           type: string
 *           enum: [PENDING, ACCEPTED, REJECTED, EXPIRED, WITHDRAWN]
 *           description: Current status of the job offer
 *         notes:
 *           type: string
 *           description: Additional notes for the job offer
 *         rejectionReason:
 *           type: string
 *           description: Reason for rejecting the job offer (if applicable)
 *         applicationId:
 *           type: string
 *           format: uuid
 *           description: Associated application ID
 *         employerId:
 *           type: string
 *           format: uuid
 *           description: ID of the employer who created the offer
 *         candidateId:
 *           type: string
 *           format: uuid
 *           description: ID of the candidate receiving the offer
 *         interviewId:
 *           type: string
 *           format: uuid
 *           description: Associated interview ID (if applicable)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the job offer was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the job offer was last updated
 *       required:
 *         - id
 *         - title
 *         - salary
 *         - expirationDate
 *         - status
 *         - applicationId
 *         - employerId
 *         - candidateId
 * 
 *     CreateJobOfferRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Job title for the offer
 *         description:
 *           type: string
 *           description: Detailed description of the job offer
 *         salary:
 *           type: number
 *           description: Offered salary
 *         benefits:
 *           type: string
 *           description: Job benefits
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Expected start date
 *         expirationDate:
 *           type: string
 *           format: date-time
 *           description: Expiration date of the offer
 *         notes:
 *           type: string
 *           description: Additional notes for the job offer
 *         interviewId:
 *           type: string
 *           format: uuid
 *           description: Associated interview ID (optional)
 *       required:
 *         - title
 *         - salary
 *         - expirationDate
 * 
 *     ResponseWithReason:
 *       type: object
 *       properties:
 *         reason:
 *           type: string
 *           description: Reason for the action
 */

/**
 * @swagger
 * tags:
 *   name: Job Offers
 *   description: Job offer management
 */

/**
 * @swagger
 * /api/v1/job-offers:
 *   get:
 *     summary: Get all job offers for the logged-in user
 *     tags: [Job Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ACCEPTED, REJECTED, EXPIRED, WITHDRAWN]
 *         description: Filter job offers by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of job offers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Job offers retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/JobOffer'
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Server error
 *
 * /api/v1/job-offers/{id}:
 *   get:
 *     summary: Get a specific job offer
 *     tags: [Job Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job offer ID
 *     responses:
 *       200:
 *         description: Job offer details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Job offer details retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/JobOffer'
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized to view this job offer
 *       404:
 *         description: Job offer not found
 *       500:
 *         description: Server error
 *
 * /api/v1/job-offers/{id}/accept:
 *   post:
 *     summary: Accept a job offer (candidate only)
 *     tags: [Job Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job offer ID
 *     responses:
 *       200:
 *         description: Job offer accepted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Job offer accepted successfully
 *                 data:
 *                   $ref: '#/components/schemas/JobOffer'
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized to accept this job offer
 *       404:
 *         description: Job offer not found
 *       400:
 *         description: Bad request - Cannot accept offer in current state
 *       500:
 *         description: Server error
 *
 * /api/v1/job-offers/{id}/reject:
 *   post:
 *     summary: Reject a job offer (candidate only)
 *     tags: [Job Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job offer ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResponseWithReason'
 *     responses:
 *       200:
 *         description: Job offer rejected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Job offer rejected successfully
 *                 data:
 *                   $ref: '#/components/schemas/JobOffer'
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized to reject this job offer
 *       404:
 *         description: Job offer not found
 *       400:
 *         description: Bad request - Cannot reject offer in current state
 *       500:
 *         description: Server error
 *
 * /api/v1/job-offers/{id}/withdraw:
 *   post:
 *     summary: Withdraw a job offer (employer only)
 *     tags: [Job Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job offer ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResponseWithReason'
 *     responses:
 *       200:
 *         description: Job offer withdrawn
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Job offer withdrawn successfully
 *                 data:
 *                   $ref: '#/components/schemas/JobOffer'
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized to withdraw this job offer
 *       404:
 *         description: Job offer not found
 *       400:
 *         description: Bad request - Cannot withdraw offer in current state
 *       500:
 *         description: Server error
 *
 * /api/v1/job-offers/application/{applicationId}:
 *   get:
 *     summary: Get job offers for a specific application
 *     tags: [Job Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: List of job offers for the application
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Application job offers retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/JobOffer'
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized to view offers for this application
 *       404:
 *         description: Application not found
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a job offer for an application (employer only)
 *     tags: [Job Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateJobOfferRequest'
 *     responses:
 *       201:
 *         description: Job offer created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Job offer created successfully
 *                 data:
 *                   $ref: '#/components/schemas/JobOffer'
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized to create job offers for this application
 *       404:
 *         description: Application or related job not found
 *       400:
 *         description: Bad request - Invalid input data
 *       500:
 *         description: Server error
 */
