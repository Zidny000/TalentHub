/**
 * @swagger
 * components:
 *   schemas:
 *     ApplicationStatus:
 *       type: string
 *       enum: [PENDING, REVIEWED, SHORTLISTED, REJECTED, HIRED]
 *       description: The current status of a job application
 *
 *     Application:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The application's unique identifier
 *         jobId:
 *           type: string
 *           format: uuid
 *           description: The ID of the job being applied to
 *         applicantId:
 *           type: string
 *           format: uuid
 *           description: The ID of the user applying for the job
 *         resumeId:
 *           type: string
 *           format: uuid
 *           description: The ID of the resume attached to the application
 *         coverLetter:
 *           type: string
 *           description: Cover letter text submitted with the application
 *         status:
 *           $ref: '#/components/schemas/ApplicationStatus'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the application was submitted
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the application was last updated
 *
 *     ApplicationRequest:
 *       type: object
 *       properties:
 *         resumeId:
 *           type: string
 *           format: uuid
 *           description: ID of the resume to attach to this application
 *         coverLetter:
 *           type: string
 *           description: Cover letter text for this application
 *           maxLength: 5000
 */

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Job application management endpoints
 */

/**
 * @swagger
 * /api/jobs/{id}/apply:
 *   post:
 *     summary: Apply to a job posting
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplicationRequest'
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Application'
 *       401:
 *         description: Unauthorized - user is not authenticated
 *       403:
 *         description: Forbidden - user is not a candidate
 *       404:
 *         description: Job not found
 */

/**
 * @swagger
 * /api/jobs/{id}/applications:
 *   get:
 *     summary: Get all applications for a specific job
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Job ID
 *     responses:
 *       200:
 *         description: List of applications for the job
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Application'
 *       401:
 *         description: Unauthorized - user is not authenticated
 *       403:
 *         description: Forbidden - user is not the employer who posted the job or an admin
 *       404:
 *         description: Job not found
 */

/**
 * @swagger
 * /api/applications/{id}:
 *   get:
 *     summary: Get detailed information about a specific application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Application'
 *       401:
 *         description: Unauthorized - user is not authenticated
 *       403:
 *         description: Forbidden - user is not the employer who posted the job or the candidate who applied
 *       404:
 *         description: Application not found
 */

/**
 * @swagger
 * /api/jobs/{id}/export:
 *   get:
 *     summary: Export all applications for a job as a CSV file
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Job ID
 *     responses:
 *       200:
 *         description: CSV file download initiated
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized - user is not authenticated
 *       403:
 *         description: Forbidden - user is not the employer who posted the job or an admin
 *       404:
 *         description: Job not found
 */

/**
 * @swagger
 * /api/applications/history:
 *   get:
 *     summary: Get user's job application history
 *     tags: [Applications]
 *     description: Returns a list of all jobs the current user has applied for
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of job applications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Application history retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Application'
 *       401:
 *         description: Unauthorized - user not authenticated
 *       403:
 *         description: Forbidden - user does not have CANDIDATE role
 */