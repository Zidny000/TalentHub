/**
 * @swagger
 * components:
 *   schemas:
 *     JobType:
 *       type: string
 *       enum: [FULL_TIME, PART_TIME, CONTRACT, REMOTE, INTERNSHIP]
 *
 *     Job:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - type
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The job's unique identifier
 *         title:
 *           type: string
 *           description: Job title
 *         description:
 *           type: string
 *           description: Job description
 *         requirements:
 *           type: string
 *           description: Job requirements
 *         location:
 *           type: string
 *           description: Job location
 *         type:
 *           $ref: '#/components/schemas/JobType'
 *         salaryMin:
 *           type: number
 *           description: Minimum salary
 *         salaryMax:
 *           type: number
 *           description: Maximum salary
 *         isPaidPost:
 *           type: boolean
 *           description: Whether this is a paid job post
 *         isActive:
 *           type: boolean
 *           description: Whether the job is active
 *         postedById:
 *           type: string
 *           format: uuid
 *           description: ID of the employer who posted the job
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the job was posted
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the job was last updated
 *
 *     CreateJobRequest:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - type
 *       properties:
 *         title:
 *           type: string
 *           description: Job title
 *         description:
 *           type: string
 *           description: Job description
 *         requirements:
 *           type: string
 *           description: Job requirements
 *         location:
 *           type: string
 *           description: Job location
 *         type:
 *           $ref: '#/components/schemas/JobType'
 *         salaryMin:
 *           type: number
 *           description: Minimum salary
 *         salaryMax:
 *           type: number
 *           description: Maximum salary
 *         isPaidPost:
 *           type: boolean
 *           description: Whether this is a paid job post
 *
 *     UpdateJobRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Job title
 *         description:
 *           type: string
 *           description: Job description
 *         requirements:
 *           type: string
 *           description: Job requirements
 *         location:
 *           type: string
 *           description: Job location
 *         type:
 *           $ref: '#/components/schemas/JobType'
 *         salaryMin:
 *           type: number
 *           description: Minimum salary
 *         salaryMax:
 *           type: number
 *           description: Maximum salary
 */

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job posting and management endpoints
 */

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: List jobs with optional filters
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for job title or description
 *       - in: query
 *         name: type
 *         schema:
 *           $ref: '#/components/schemas/JobType'
 *         description: Filter by job type
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: minSalary
 *         schema:
 *           type: integer
 *         description: Minimum salary filter
 *       - in: query
 *         name: maxSalary
 *         schema:
 *           type: integer
 *         description: Maximum salary filter
 *       - in: query
 *         name: active
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by active status
 *         default: true
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *         default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *         default: 20
 *     responses:
 *       200:
 *         description: List of jobs with pagination
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
 *                   type: object
 *                   properties:
 *                     jobs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Job'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         pageSize:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *
 *   post:
 *     summary: Create a new job posting
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateJobRequest'
 *     responses:
 *       201:
 *         description: Job created successfully
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
 *                   oneOf:
 *                     - $ref: '#/components/schemas/Job'
 *                     - type: object
 *                       properties:
 *                         job:
 *                           $ref: '#/components/schemas/Job'
 *                         paymentRequired:
 *                           type: boolean
 *                           description: Whether payment is required for this job post
 *                         paymentUrl:
 *                           type: string
 *                           description: URL to initiate payment if required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not an employer or admin, or has reached free post limit
 */

/**
 * @swagger
 * /api/jobs/my/listings:
 *   get:
 *     summary: Get jobs posted by the current user
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of jobs posted by the user
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
 *                     $ref: '#/components/schemas/Job'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Get job details by ID
 *     tags: [Jobs]
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
 *         description: Job details
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
 *                   $ref: '#/components/schemas/Job'
 *       404:
 *         description: Job not found
 *
 *   patch:
 *     summary: Update a job posting
 *     tags: [Jobs]
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
 *             $ref: '#/components/schemas/UpdateJobRequest'
 *     responses:
 *       200:
 *         description: Job updated successfully
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
 *                   $ref: '#/components/schemas/Job'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not the job owner or an admin
 *       404:
 *         description: Job not found
 *
 *   delete:
 *     summary: Delete a job posting (soft delete)
 *     tags: [Jobs]
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
 *         description: Job deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not the job owner or an admin
 *       404:
 *         description: Job not found
 */