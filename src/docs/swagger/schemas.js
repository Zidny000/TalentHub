/**
 * @swagger
 * components:
 *   schemas:
 *     InterviewRequest:
 *       type: object
 *       required:
 *         - scheduledAt
 *         - duration
 *       properties:
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the interview is scheduled
 *         duration:
 *           type: integer
 *           minimum: 15
 *           maximum: 240
 *           description: Duration of the interview in minutes
 *         location:
 *           type: string
 *           description: Location of the interview (physical address or virtual meeting link)
 *         description:
 *           type: string
 *           description: Additional details about the interview
 *       example:
 *         scheduledAt: "2025-10-25T14:00:00Z"
 *         duration: 60
 *         location: "https://zoom.us/meeting/123456"
 *         description: "Technical interview for Frontend Developer position"
 *
 *     InterviewUpdateRequest:
 *       type: object
 *       properties:
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the interview is scheduled
 *         duration:
 *           type: integer
 *           minimum: 15
 *           maximum: 240
 *           description: Duration of the interview in minutes
 *         location:
 *           type: string
 *           description: Location of the interview (physical address or virtual meeting link)
 *         description:
 *           type: string
 *           description: Additional details about the interview
 *       example:
 *         scheduledAt: "2025-10-26T15:00:00Z"
 *         duration: 45
 *         location: "https://meet.google.com/abc-defg-hij"
 *
 *     Interview:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique ID of the interview
 *         applicationId:
 *           type: string
 *           description: ID of the job application
 *         employerId:
 *           type: string
 *           description: ID of the employer
 *         candidateId:
 *           type: string
 *           description: ID of the candidate
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *           description: Date and time of the interview
 *         duration:
 *           type: integer
 *           description: Duration in minutes
 *         location:
 *           type: string
 *           description: Location (physical or virtual)
 *         description:
 *           type: string
 *           description: Interview description
 *         status:
 *           type: string
 *           enum: [SCHEDULED, RESCHEDULED, CANCELLED, COMPLETED]
 *           description: Status of the interview
 *         feedback:
 *           type: string
 *           description: Feedback after interview or reason for cancellation
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         applicationId: "123e4567-e89b-12d3-a456-426614174001"
 *         employerId: "123e4567-e89b-12d3-a456-426614174002"
 *         candidateId: "123e4567-e89b-12d3-a456-426614174003"
 *         scheduledAt: "2025-10-25T14:00:00Z"
 *         duration: 60
 *         location: "https://zoom.us/meeting/123456"
 *         description: "Technical interview for Frontend Developer position"
 *         status: "SCHEDULED"
 *         createdAt: "2025-10-17T09:00:00Z"
 *         updatedAt: "2025-10-17T09:00:00Z"
 *
 *     InterviewResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         statusCode:
 *           type: integer
 *           example: 200
 *         message:
 *           type: string
 *           example: "Interview scheduled successfully"
 *         data:
 *           $ref: '#/components/schemas/Interview'
 *
 *     InterviewsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         statusCode:
 *           type: integer
 *           example: 200
 *         message:
 *           type: string
 *           example: "Interviews retrieved successfully"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Interview'
 *
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         password:
 *           type: string
 *           format: password
 *         isVerified:
 *           type: boolean
 *           example: false
 *         twoFactorEnabled:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     UserInput:
 *       type: object
 *       required: [name, email, password]
 *       properties:
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: securePassword123!
 *
 *     LoginInput:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: securePassword123!
 *
 *     TwoFactorVerifyInput:
 *       type: object
 *       required: [email, code]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         code:
 *           type: string
 *           example: 123456
 *
 *     RefreshTokenInput:
 *       type: object
 *       required: [refreshToken]
 *       properties:
 *         refreshToken:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Operation successful
 *         accessToken:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         refreshToken:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             name:
 *               type: string
 *               example: John Doe
 *             email:
 *               type: string
 *               format: email
 *               example: john@example.com
 *             isVerified:
 *               type: boolean
 *               example: true
 *             twoFactorEnabled:
 *               type: boolean
 *               example: false
 *
 *     EmailVerificationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Email verified successfully
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: An error occurred
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *     PaymentInfo:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The payment's unique identifier
 *         amount:
 *           type: number
 *           description: Amount in cents
 *         currency:
 *           type: string
 *           enum: [USD]
 *           default: USD
 *         status:
 *           type: string
 *           enum: [PENDING, SUCCESS, FAILED]
 *           description: Payment status
 *         provider:
 *           type: string
 *           description: Payment provider (e.g., 'stripe')
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 */