-- CreateEnum
CREATE TYPE "ClientMessageStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "hashed_password" VARCHAR(255) NOT NULL,
    "role_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "client_message_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_messages" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "category_id" UUID NOT NULL,
    "brief" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "client_user_id" UUID,
    "status" "ClientMessageStatus" NOT NULL DEFAULT 'pending',
    "approved_at" TIMESTAMPTZ,
    "approved_by" UUID,
    "rejection_reason" TEXT,
    "generated_email" VARCHAR(100),
    "generated_password" VARCHAR(100),
    "credentials_sent_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contactus" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "category_id" UUID NOT NULL,
    "whatyouneed" VARCHAR(255) NOT NULL,
    "brief" VARCHAR(500) NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contactus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generalcontactus" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "brief" VARCHAR(500) NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generalcontactus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enquiry_categories" (
    "id" UUID NOT NULL,
    "form_type" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_active" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enquiry_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portal_dashboards" (
    "id" UUID NOT NULL,
    "client_message_id" UUID NOT NULL,
    "health_score" INTEGER NOT NULL DEFAULT 0,
    "health_components" JSONB NOT NULL DEFAULT '{}',
    "timeline" JSONB NOT NULL DEFAULT '[]',
    "evaluation_data" JSONB NOT NULL DEFAULT '{}',
    "management_data" JSONB NOT NULL DEFAULT '{}',
    "marketplace_data" JSONB NOT NULL DEFAULT '{}',
    "investment_data" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portal_dashboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portal_alerts" (
    "id" UUID NOT NULL,
    "dashboard_id" UUID NOT NULL,
    "severity" VARCHAR(20) NOT NULL DEFAULT 'info',
    "title" VARCHAR(200) NOT NULL,
    "message" VARCHAR(500) NOT NULL DEFAULT '',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portal_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portal_messages" (
    "id" UUID NOT NULL,
    "dashboard_id" UUID NOT NULL,
    "sender" VARCHAR(20) NOT NULL DEFAULT 'client',
    "subject" VARCHAR(300) NOT NULL DEFAULT '',
    "body" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portal_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portal_actions" (
    "id" UUID NOT NULL,
    "dashboard_id" UUID NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "assignee" VARCHAR(120) NOT NULL DEFAULT '',
    "column" VARCHAR(40) NOT NULL DEFAULT 'todo',
    "priority" VARCHAR(20) NOT NULL DEFAULT 'medium',
    "due_date" TIMESTAMPTZ,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portal_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_logs" (
    "id" UUID NOT NULL,
    "level" VARCHAR(20) NOT NULL,
    "message" TEXT NOT NULL,
    "source" VARCHAR(100) NOT NULL,
    "user_id" UUID,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "log_metadata" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_portal_services" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "client_message_id" UUID NOT NULL,
    "portal_type" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_portal_services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE INDEX "enquiry_categories_form_type_idx" ON "enquiry_categories"("form_type");

-- CreateIndex
CREATE UNIQUE INDEX "portal_dashboards_client_message_id_key" ON "portal_dashboards"("client_message_id");

-- CreateIndex
CREATE INDEX "portal_alerts_dashboard_id_idx" ON "portal_alerts"("dashboard_id");

-- CreateIndex
CREATE INDEX "portal_messages_dashboard_id_idx" ON "portal_messages"("dashboard_id");

-- CreateIndex
CREATE INDEX "portal_actions_dashboard_id_idx" ON "portal_actions"("dashboard_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_portal_services_client_message_id_key" ON "user_portal_services"("client_message_id");

-- CreateIndex
CREATE INDEX "user_portal_services_user_id_idx" ON "user_portal_services"("user_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_client_message_id_fkey" FOREIGN KEY ("client_message_id") REFERENCES "client_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_messages" ADD CONSTRAINT "client_messages_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "enquiry_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_messages" ADD CONSTRAINT "client_messages_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_messages" ADD CONSTRAINT "client_messages_client_user_id_fkey" FOREIGN KEY ("client_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contactus" ADD CONSTRAINT "contactus_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "enquiry_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_dashboards" ADD CONSTRAINT "portal_dashboards_client_message_id_fkey" FOREIGN KEY ("client_message_id") REFERENCES "client_messages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_alerts" ADD CONSTRAINT "portal_alerts_dashboard_id_fkey" FOREIGN KEY ("dashboard_id") REFERENCES "portal_dashboards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_messages" ADD CONSTRAINT "portal_messages_dashboard_id_fkey" FOREIGN KEY ("dashboard_id") REFERENCES "portal_dashboards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_actions" ADD CONSTRAINT "portal_actions_dashboard_id_fkey" FOREIGN KEY ("dashboard_id") REFERENCES "portal_dashboards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_portal_services" ADD CONSTRAINT "user_portal_services_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_portal_services" ADD CONSTRAINT "user_portal_services_client_message_id_fkey" FOREIGN KEY ("client_message_id") REFERENCES "client_messages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
