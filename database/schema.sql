-- WMS_ServiceUser schema (PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "User" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" VARCHAR(100) NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "phone" VARCHAR(15),
  "provider" VARCHAR(255),
  "asRole" VARCHAR(50),
  "isActive" BOOLEAN DEFAULT true,
  "nrp" VARCHAR(50),
  "password" VARCHAR(200),
  "createdBy" VARCHAR(100),
  "updatedBy" VARCHAR(100),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deletedAt" TIMESTAMPTZ,
  "deletedBy" VARCHAR(100),
  "token" VARCHAR(200)
);

CREATE TABLE "Role" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(50) NOT NULL,
  "description" VARCHAR(100),
  "createdBy" VARCHAR(100) NOT NULL,
  "updatedBy" VARCHAR(100),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deletedAt" TIMESTAMPTZ,
  "deletedBy" VARCHAR(100)
);

CREATE TABLE "UserRole" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"("id"),
  "roleId" UUID NOT NULL REFERENCES "Role"("id"),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "createdBy" UUID NOT NULL,
  "deletedAt" TIMESTAMPTZ,
  "deletedBy" UUID
);

CREATE TABLE "Menu" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "parentId" UUID REFERENCES "Menu"("id"),
  "level" INTEGER NOT NULL,
  "menu" VARCHAR(50) NOT NULL,
  "url" VARCHAR(50),
  "icon" VARCHAR(50),
  "order" INTEGER NOT NULL,
  "isTab" BOOLEAN DEFAULT false,
  "menuCode" VARCHAR(50),
  "createdBy" VARCHAR(50),
  "updatedBy" VARCHAR(50),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deletedAt" TIMESTAMPTZ,
  "deletedBy" VARCHAR(50)
);

CREATE TABLE "Uam" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "roleId" UUID NOT NULL REFERENCES "Role"("id"),
  "menuId" UUID NOT NULL REFERENCES "Menu"("id"),
  "canCreate" BOOLEAN NOT NULL,
  "canRead" BOOLEAN NOT NULL,
  "canUpdate" BOOLEAN NOT NULL,
  "canDelete" BOOLEAN NOT NULL,
  "canEtc" BOOLEAN NOT NULL,
  "createdBy" VARCHAR(100) NOT NULL,
  "updatedBy" VARCHAR(100),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deletedAt" TIMESTAMPTZ,
  "deletedBy" VARCHAR(100)
);

CREATE TABLE "LoginAttempt" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" VARCHAR(100) NOT NULL,
  "attemptCount" INTEGER NOT NULL DEFAULT 0,
  "banExpiresAt" TIMESTAMPTZ,
  "userId" UUID REFERENCES "User"("id"),
  "createdBy" UUID NOT NULL REFERENCES "User"("id"),
  "updatedBy" UUID NOT NULL REFERENCES "User"("id"),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "LoginHistory" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" VARCHAR(100) NOT NULL,
  "asRole" VARCHAR(50) NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "createdBy" VARCHAR(100),
  "userId" UUID NOT NULL
);

CREATE TABLE "UserRoleBranch" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userRoleId" UUID NOT NULL REFERENCES "UserRole"("id"),
  "branchId" VARCHAR(15) NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "UserLoginActivity" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID,
  "platform" VARCHAR(255),
  "ipAddress" VARCHAR(40),
  "channel" VARCHAR(10),
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "createdBy" UUID,
  "name" VARCHAR(255),
  "email" VARCHAR(255)
);

CREATE TABLE "Customer" (
  "ID" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "Code" VARCHAR(50),
  "Name" VARCHAR(75),
  "Address" VARCHAR(200),
  "Phone" VARCHAR(50),
  "CreatedAt" TIMESTAMPTZ DEFAULT now(),
  "CreatedBy" VARCHAR(100),
  "UpdatedAt" TIMESTAMPTZ,
  "UpdatedBy" VARCHAR(100),
  "DeletedAt" TIMESTAMPTZ,
  "DeletedBy" VARCHAR(100)
);

CREATE TABLE "UserRoleWarehouse" (
  "ID" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "UserRoleId" UUID REFERENCES "UserRole"("id"),
  "WarehouseId" UUID,
  "CreatedAt" TIMESTAMPTZ DEFAULT now(),
  "CreatedBy" VARCHAR(100),
  "UpdatedAt" TIMESTAMPTZ,
  "UpdatedBy" VARCHAR(100),
  "DeletedAt" TIMESTAMPTZ,
  "DeletedBy" VARCHAR(100)
);

CREATE TABLE "Warehouse" (
  "ID" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "CustomerId" UUID REFERENCES "Customer"("ID"),
  "Code" VARCHAR(50),
  "Name" VARCHAR(75),
  "Address" VARCHAR(200),
  "Phone" VARCHAR(50),
  "CreatedAt" TIMESTAMPTZ DEFAULT now(),
  "CreatedBy" VARCHAR(100),
  "UpdatedAt" TIMESTAMPTZ,
  "UpdatedBy" VARCHAR(100),
  "DeletedAt" TIMESTAMPTZ,
  "DeletedBy" VARCHAR(100)
);

DO $$ BEGIN
  ALTER TABLE "UserRoleWarehouse"
    ADD CONSTRAINT "UserRoleWarehouse_WarehouseId_fkey"
    FOREIGN KEY ("WarehouseId") REFERENCES "Warehouse"("ID");
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX idx_user_email ON "User"("email");
CREATE INDEX idx_user_deleted ON "User"("deletedAt");
CREATE INDEX idx_userrole_user ON "UserRole"("userId");
CREATE INDEX idx_uam_role ON "Uam"("roleId");
CREATE INDEX idx_uam_menu ON "Uam"("menuId");
