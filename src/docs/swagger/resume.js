/**
 * @swagger
 * components:
 *   schemas:
 *     Experience:
 *       type: object
 *       properties:
 *         company:
 *           type: string
 *           description: Company name
 *         position:
 *           type: string
 *           description: Job position or title
 *         startDate:
 *           type: string
 *           description: Start date of the experience
 *         endDate:
 *           type: string
 *           description: End date of the experience or 'Present'
 *         description:
 *           type: string
 *           description: Description of responsibilities and achievements
 *
 *     Resume:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         id:
 *           type: string
 *           description: Resume unique identifier
 *         userId:
 *           type: string
 *           description: ID of the user who owns this resume
 *         title:
 *           type: string
 *           description: Resume title
 *         summary:
 *           type: string
 *           description: Professional summary
 *         experiences:
 *           type: array
 *           description: List of work experiences
 *           items:
 *             $ref: '#/components/schemas/Experience'
 *         skills:
 *           type: string
 *           description: Comma-separated list of skills
 *         pdfUrl:
 *           type: string
 *           description: URL to the generated PDF version
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateResumeRequest:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *         summary:
 *           type: string
 *         experiences:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Experience'
 *         skills:
 *           type: string
 *
 *     UpdateResumeRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         summary:
 *           type: string
 *         experiences:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Experience'
 *         skills:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Resumes
 *   description: Resume management endpoints
 */

/**
 * @swagger
 * /api/resumes:
 *   post:
 *     summary: Create a new resume
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateResumeRequest'
 *     responses:
 *       201:
 *         description: Resume created successfully
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
 *                   $ref: '#/components/schemas/Resume'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/resumes/my-resumes:
 *   get:
 *     summary: Get all resumes for the current user
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of resumes
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
 *                     $ref: '#/components/schemas/Resume'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/resumes/{id}:
 *   get:
 *     summary: Get a resume by ID
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resume ID
 *     responses:
 *       200:
 *         description: Resume details
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
 *                   $ref: '#/components/schemas/Resume'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Resume not found
 *
 *   put:
 *     summary: Update a resume
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resume ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateResumeRequest'
 *     responses:
 *       200:
 *         description: Resume updated successfully
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
 *                   $ref: '#/components/schemas/Resume'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user does not own this resume
 *       404:
 *         description: Resume not found
 *
 *   delete:
 *     summary: Delete a resume
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resume ID
 *     responses:
 *       200:
 *         description: Resume deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user does not own this resume
 *       404:
 *         description: Resume not found
 */

/**
 * @swagger
 * /api/resumes/{id}/pdf:
 *   get:
 *     summary: Get the PDF version of a resume
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Resume ID
 *     responses:
 *       200:
 *         description: PDF file download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             schema:
 *               type: string
 *               description: Attachment filename
 *       401:
 *         description: Unauthorized - user is not authenticated
 *       403:
 *         description: Forbidden - user is not the owner of this resume
 *       404:
 *         description: Resume not found
 */