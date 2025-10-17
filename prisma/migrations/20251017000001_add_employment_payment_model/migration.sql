-- Create EmploymentPaymentStatus enum
CREATE TYPE "EmploymentPaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- Add EmploymentPayment model
CREATE TABLE "EmploymentPayment" (
  "id" TEXT NOT NULL,
  "employerId" TEXT NOT NULL,
  "candidateId" TEXT NOT NULL,
  "jobOfferId" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "description" TEXT,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "provider" TEXT NOT NULL,
  "stripeSessionId" TEXT,
  "status" "EmploymentPaymentStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "EmploymentPayment_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "EmploymentPayment_employerId_idx" ON "EmploymentPayment"("employerId");
CREATE INDEX "EmploymentPayment_candidateId_idx" ON "EmploymentPayment"("candidateId");
CREATE INDEX "EmploymentPayment_jobOfferId_idx" ON "EmploymentPayment"("jobOfferId");
CREATE INDEX "EmploymentPayment_status_idx" ON "EmploymentPayment"("status");

-- Add foreign key constraints
ALTER TABLE "EmploymentPayment" ADD CONSTRAINT "EmploymentPayment_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EmploymentPayment" ADD CONSTRAINT "EmploymentPayment_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EmploymentPayment" ADD CONSTRAINT "EmploymentPayment_jobOfferId_fkey" FOREIGN KEY ("jobOfferId") REFERENCES "JobOffer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;