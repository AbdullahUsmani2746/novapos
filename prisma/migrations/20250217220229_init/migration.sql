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
    "acname" VARCHAR(100) NOT NULL,
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

-- CreateIndex
CREATE UNIQUE INDEX "MBSCD_bscd_key" ON "MBSCD"("bscd");

-- CreateIndex
CREATE UNIQUE INDEX "BSCD_bscd_key" ON "BSCD"("bscd");

-- CreateIndex
CREATE UNIQUE INDEX "MACNO_macno_key" ON "MACNO"("macno");

-- CreateIndex
CREATE UNIQUE INDEX "acno_acno_key" ON "acno"("acno");

-- AddForeignKey
ALTER TABLE "BSCD" ADD CONSTRAINT "BSCD_mbscd_fkey" FOREIGN KEY ("mbscd") REFERENCES "MBSCD"("bscd") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MACNO" ADD CONSTRAINT "MACNO_bscd_fkey" FOREIGN KEY ("bscd") REFERENCES "BSCD"("bscd") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acno" ADD CONSTRAINT "acno_macno_fkey" FOREIGN KEY ("macno") REFERENCES "MACNO"("macno") ON DELETE RESTRICT ON UPDATE CASCADE;
