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

-- AddForeignKey
ALTER TABLE "Godown" ADD CONSTRAINT "Godown_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
