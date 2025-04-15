-- CreateTable
CREATE TABLE "Company" (
    "company_id" VARCHAR(2) NOT NULL,
    "company" VARCHAR(100),
    "addr1" VARCHAR(100),
    "addr2" VARCHAR(100),
    "city" VARCHAR(50),
    "phone" VARCHAR(50),
    "fax" VARCHAR(50),
    "email" VARCHAR(50),

    CONSTRAINT "Company_pkey" PRIMARY KEY ("company_id")
);

-- CreateTable
CREATE TABLE "CostCenter" (
    "ccno" INTEGER NOT NULL,
    "company_id" VARCHAR(2) NOT NULL,
    "ccname" VARCHAR(50),

    CONSTRAINT "CostCenter_pkey" PRIMARY KEY ("ccno")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_company_id_key" ON "Company"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "CostCenter_ccno_key" ON "CostCenter"("ccno");

-- AddForeignKey
ALTER TABLE "CostCenter" ADD CONSTRAINT "CostCenter_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;
