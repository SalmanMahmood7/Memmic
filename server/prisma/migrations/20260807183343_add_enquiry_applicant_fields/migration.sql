-- AlterTable
ALTER TABLE "client_messages" ADD COLUMN     "applicant_type" VARCHAR(20),
ADD COLUMN     "company_name" VARCHAR(150),
ADD COLUMN     "related_category" VARCHAR(100);
