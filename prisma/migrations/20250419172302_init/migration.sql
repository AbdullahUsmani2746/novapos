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
    "dept_code" VARCHAR(100) NOT NULL,
    "dept_name" VARCHAR(100),
    "company_id" INTEGER NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Item" (
    "itcd" INTEGER NOT NULL,
    "item_name" VARCHAR(50),

    CONSTRAINT "Item_pkey" PRIMARY KEY ("itcd")
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

-- CreateIndex
CREATE UNIQUE INDEX "Users_user_id_key" ON "Users"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_currency_key" ON "Currency"("currency");

-- CreateIndex
CREATE UNIQUE INDEX "TRANSACTIONS_MASTER_vr_no_key" ON "TRANSACTIONS_MASTER"("vr_no");

-- CreateIndex
CREATE UNIQUE INDEX "Item_itcd_key" ON "Item"("itcd");

-- AddForeignKey
ALTER TABLE "CostCenter" ADD CONSTRAINT "CostCenter_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Godown" ADD CONSTRAINT "Godown_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TRANSACTIONS_MASTER" ADD CONSTRAINT "TRANSACTIONS_MASTER_pycd_fkey" FOREIGN KEY ("pycd") REFERENCES "acno"("acno") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TRANSACTIONS_MASTER" ADD CONSTRAINT "TRANSACTIONS_MASTER_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TRANSACTIONS_MASTER" ADD CONSTRAINT "TRANSACTIONS_MASTER_USER_ID_fkey" FOREIGN KEY ("USER_ID") REFERENCES "Users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TRANSACTIONS_MASTER" ADD CONSTRAINT "TRANSACTIONS_MASTER_godown_fkey" FOREIGN KEY ("godown") REFERENCES "Godown"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_tran_id_fkey" FOREIGN KEY ("tran_id") REFERENCES "TRANSACTIONS_MASTER"("tran_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_acno_fkey" FOREIGN KEY ("acno") REFERENCES "acno"("acno") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_itcd_fkey" FOREIGN KEY ("itcd") REFERENCES "Item"("itcd") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_ccno_fkey" FOREIGN KEY ("ccno") REFERENCES "CostCenter"("ccno") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_godown_fkey" FOREIGN KEY ("godown") REFERENCES "Godown"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_currency_fkey" FOREIGN KEY ("currency") REFERENCES "Currency"("currency") ON DELETE RESTRICT ON UPDATE CASCADE;
