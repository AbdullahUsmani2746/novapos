-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'DIRECT_DEPOSIT', 'CHEQUE');

-- CreateEnum
CREATE TYPE "PayType" AS ENUM ('HOUR', 'SALARY');

-- CreateEnum
CREATE TYPE "PayFrequency" AS ENUM ('Monthly', 'Fortnightly', 'Weekly');

-- CreateTable
CREATE TABLE "MBSCD" (
    "bscd" VARCHAR(2) NOT NULL,
    "bscdDetail" VARCHAR(100) NOT NULL,

    CONSTRAINT "MBSCD_pkey" PRIMARY KEY ("bscd")
);

-- CreateTable
CREATE TABLE "BSCD" (
    "bscd" VARCHAR(2) NOT NULL,
    "mbscd" VARCHAR(2) NOT NULL,
    "bscdDetail" VARCHAR(100) NOT NULL,

    CONSTRAINT "BSCD_pkey" PRIMARY KEY ("mbscd","bscd")
);

-- CreateTable
CREATE TABLE "MACNO" (
    "macno" VARCHAR(3) NOT NULL,
    "bscd" VARCHAR(2) NOT NULL,
    "macname" VARCHAR(100) NOT NULL,

    CONSTRAINT "MACNO_pkey" PRIMARY KEY ("bscd","macno")
);

-- CreateTable
CREATE TABLE "acno" (
    "acno" VARCHAR(4) NOT NULL,
    "macno" VARCHAR(3) NOT NULL,
    "acname" VARCHAR(250) NOT NULL,
    "bank_account_no" VARCHAR(25),
    "address" VARCHAR(150),
    "city" VARCHAR(50),
    "phone_fax" VARCHAR(50),
    "email" VARCHAR(25),
    "website" VARCHAR(25),
    "cr_days" INTEGER,
    "st_rate" DECIMAL(15,2),
    "area" VARCHAR(50),
    "catagory" VARCHAR(50),
    "sub_catagory" VARCHAR(25),
    "country" VARCHAR(25),
    "customer_bank" VARCHAR(50),
    "customer_bank_addr" VARCHAR(100),
    "st_reg_no" VARCHAR(25),
    "ntn_no" VARCHAR(25),
    "contact_person" VARCHAR(25),
    "cr_limit" INTEGER,
    "sales_ares" VARCHAR(25),

    CONSTRAINT "acno_pkey" PRIMARY KEY ("macno","acno")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "company" VARCHAR(100),
    "addr1" VARCHAR(100),
    "addr2" VARCHAR(100),
    "city" VARCHAR(50),
    "phone" VARCHAR(50),
    "fax" VARCHAR(50),
    "email" VARCHAR(50),

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostCenter" (
    "ccno" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "ccname" VARCHAR(50),

    CONSTRAINT "CostCenter_pkey" PRIMARY KEY ("ccno")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "dept_name" VARCHAR(100),
    "company_id" INTEGER NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductMasterCategory" (
    "id" SERIAL NOT NULL,
    "pmc_name" VARCHAR(250),

    CONSTRAINT "ProductMasterCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductGroup" (
    "id" SERIAL NOT NULL,
    "pg_name" VARCHAR(250),
    "pmc_id" INTEGER NOT NULL,

    CONSTRAINT "ProductGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" SERIAL NOT NULL,
    "pc_name" VARCHAR(250),
    "pg_id" INTEGER NOT NULL,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MainCategory" (
    "id" SERIAL NOT NULL,
    "mc_name" VARCHAR(100),
    "pc_id" INTEGER NOT NULL,

    CONSTRAINT "MainCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemCategory" (
    "id" SERIAL NOT NULL,
    "ic_name" VARCHAR(250),
    "mc_id" INTEGER NOT NULL,

    CONSTRAINT "ItemCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "itcd" INTEGER NOT NULL,
    "item" VARCHAR(250),
    "ic_id" INTEGER NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("itcd")
);

-- CreateTable
CREATE TABLE "Designation" (
    "id" SERIAL NOT NULL,
    "desg_name" VARCHAR(100),
    "company_id" INTEGER NOT NULL,

    CONSTRAINT "Designation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Godown" (
    "id" SERIAL NOT NULL,
    "godown" VARCHAR(100) NOT NULL,
    "company_id" INTEGER NOT NULL,

    CONSTRAINT "Godown_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialYear" (
    "id" SERIAL NOT NULL,
    "date_from" TIMESTAMP(3) NOT NULL,
    "date_to" TIMESTAMP(3) NOT NULL,
    "status" CHAR(50) NOT NULL,

    CONSTRAINT "FinancialYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" SERIAL NOT NULL,
    "date_from" TIMESTAMP(3) NOT NULL,
    "date_to" TIMESTAMP(3) NOT NULL,
    "status" CHAR(50) NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoPrdCat" (
    "id" SERIAL NOT NULL,
    "category_name" CHAR(50) NOT NULL,

    CONSTRAINT "PoPrdCat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryMode" (
    "id" SERIAL NOT NULL,
    "delivery_mode" CHAR(50) NOT NULL,
    "rate_kg" INTEGER NOT NULL,

    CONSTRAINT "DeliveryMode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "user_id" VARCHAR(10) NOT NULL,
    "user_name" VARCHAR(50),
    "company_id" INTEGER NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Currency" (
    "currency" VARCHAR(50) NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("currency")
);

-- CreateTable
CREATE TABLE "TRANSACTIONS_MASTER" (
    "tran_id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "dateD" TIMESTAMP(3),
    "time" TIMESTAMP(3),
    "tran_code" INTEGER NOT NULL,
    "vr_no" INTEGER NOT NULL,
    "pycd" TEXT NOT NULL,
    "CHECK_NO" TEXT,
    "CHECK_DATE" TIMESTAMP(3),
    "RMK" TEXT,
    "RMK1" TEXT,
    "RMK2" TEXT,
    "RMK3" TEXT,
    "RMK4" TEXT,
    "RMK5" TEXT,
    "USER_ID" TEXT NOT NULL,
    "invoice_no" CHAR(150),
    "godown" INTEGER,

    CONSTRAINT "TRANSACTIONS_MASTER_pkey" PRIMARY KEY ("tran_id")
);

-- CreateTable
CREATE TABLE "Transactions" (
    "tran_id" SERIAL NOT NULL,
    "acno" TEXT NOT NULL,
    "itcd" INTEGER NOT NULL,
    "ccno" INTEGER NOT NULL,
    "narration1" CHAR(150),
    "narration2" CHAR(150),
    "narration3" CHAR(150),
    "narration4" CHAR(150),
    "narration5" CHAR(150),
    "chno" CHAR(150),
    "check_date" TIMESTAMP(3),
    "party_name" CHAR(150),
    "damt" DOUBLE PRECISION,
    "camt" DOUBLE PRECISION,
    "qty" DOUBLE PRECISION,
    "rate" DOUBLE PRECISION,
    "wht_rate" DOUBLE PRECISION,
    "st_rate" DOUBLE PRECISION,
    "godown" INTEGER NOT NULL,
    "invoice_no" CHAR(150),
    "sub_tran_id" INTEGER NOT NULL DEFAULT 1,
    "currency" CHAR(50) NOT NULL,
    "fc_amount" DOUBLE PRECISION NOT NULL,
    "no_of_pack" INTEGER,
    "qty_per_pack" INTEGER,
    "st_amount" INTEGER,
    "additional_tax" INTEGER,

    CONSTRAINT "Transactions_pkey" PRIMARY KEY ("tran_id")
);

-- CreateTable
CREATE TABLE "DeliveryTerm" (
    "id" SERIAL NOT NULL,
    "delivery_term" CHAR(50) NOT NULL,

    CONSTRAINT "DeliveryTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionTerm" (
    "id" SERIAL NOT NULL,
    "commission_term" CHAR(50) NOT NULL,

    CONSTRAINT "CommissionTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "surname" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "gender" "Gender",
    "phone_number" TEXT NOT NULL,
    "npf_number" TEXT NOT NULL,
    "email_address" TEXT NOT NULL,
    "village" TEXT NOT NULL,
    "status" "Status",
    "hire_date" TIMESTAMP(3) NOT NULL,
    "job_title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "work_location" TEXT NOT NULL,
    "manager_id" TEXT,
    "client_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "payment_method" "PaymentMethod",
    "bank_name" TEXT,
    "account_name" TEXT,
    "account_number" TEXT,
    "pay_type" "PayType",
    "rate_per_hour" DOUBLE PRECISION NOT NULL,
    "pay_frequency" "PayFrequency",
    "employee_type" TEXT NOT NULL,
    "cost_center" TEXT NOT NULL,
    "allownces" JSONB NOT NULL,
    "allownce_eligible" BOOLEAN NOT NULL DEFAULT false,
    "deductions" JSONB NOT NULL,
    "profile_image" TEXT,
    "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leave" (
    "id" TEXT NOT NULL,
    "leave_id" TEXT NOT NULL,
    "available" DOUBLE PRECISION NOT NULL,
    "employee_id" TEXT NOT NULL,

    CONSTRAINT "Leave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "employee_id" TEXT NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Manager" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Manager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employer" (
    "employer_id" TEXT NOT NULL,

    CONSTRAINT "Employer_pkey" PRIMARY KEY ("employer_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MBSCD_bscd_key" ON "MBSCD"("bscd");

-- CreateIndex
CREATE UNIQUE INDEX "BSCD_bscd_key" ON "BSCD"("bscd");

-- CreateIndex
CREATE UNIQUE INDEX "MACNO_macno_key" ON "MACNO"("macno");

-- CreateIndex
CREATE UNIQUE INDEX "acno_acno_key" ON "acno"("acno");

-- CreateIndex
CREATE UNIQUE INDEX "Item_itcd_key" ON "Item"("itcd");

-- CreateIndex
CREATE UNIQUE INDEX "Users_user_id_key" ON "Users"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_currency_key" ON "Currency"("currency");

-- CreateIndex
CREATE UNIQUE INDEX "TRANSACTIONS_MASTER_vr_no_key" ON "TRANSACTIONS_MASTER"("vr_no");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employee_id_key" ON "Employee"("employee_id");

-- AddForeignKey
ALTER TABLE "BSCD" ADD CONSTRAINT "BSCD_mbscd_fkey" FOREIGN KEY ("mbscd") REFERENCES "MBSCD"("bscd") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MACNO" ADD CONSTRAINT "MACNO_bscd_fkey" FOREIGN KEY ("bscd") REFERENCES "BSCD"("bscd") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acno" ADD CONSTRAINT "acno_macno_fkey" FOREIGN KEY ("macno") REFERENCES "MACNO"("macno") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostCenter" ADD CONSTRAINT "CostCenter_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductGroup" ADD CONSTRAINT "ProductGroup_pmc_id_fkey" FOREIGN KEY ("pmc_id") REFERENCES "ProductMasterCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_pg_id_fkey" FOREIGN KEY ("pg_id") REFERENCES "ProductGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MainCategory" ADD CONSTRAINT "MainCategory_pc_id_fkey" FOREIGN KEY ("pc_id") REFERENCES "ProductCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemCategory" ADD CONSTRAINT "ItemCategory_mc_id_fkey" FOREIGN KEY ("mc_id") REFERENCES "MainCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_ic_id_fkey" FOREIGN KEY ("ic_id") REFERENCES "ItemCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Designation" ADD CONSTRAINT "Designation_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Godown" ADD CONSTRAINT "Godown_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TRANSACTIONS_MASTER" ADD CONSTRAINT "TRANSACTIONS_MASTER_USER_ID_fkey" FOREIGN KEY ("USER_ID") REFERENCES "Users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TRANSACTIONS_MASTER" ADD CONSTRAINT "TRANSACTIONS_MASTER_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TRANSACTIONS_MASTER" ADD CONSTRAINT "TRANSACTIONS_MASTER_godown_fkey" FOREIGN KEY ("godown") REFERENCES "Godown"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TRANSACTIONS_MASTER" ADD CONSTRAINT "TRANSACTIONS_MASTER_pycd_fkey" FOREIGN KEY ("pycd") REFERENCES "acno"("acno") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_acno_fkey" FOREIGN KEY ("acno") REFERENCES "acno"("acno") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_ccno_fkey" FOREIGN KEY ("ccno") REFERENCES "CostCenter"("ccno") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_currency_fkey" FOREIGN KEY ("currency") REFERENCES "Currency"("currency") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_godown_fkey" FOREIGN KEY ("godown") REFERENCES "Godown"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_itcd_fkey" FOREIGN KEY ("itcd") REFERENCES "Item"("itcd") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_tran_id_fkey" FOREIGN KEY ("tran_id") REFERENCES "TRANSACTIONS_MASTER"("tran_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "Manager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Employer"("employer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leave" ADD CONSTRAINT "Leave_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
