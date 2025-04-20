-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "dept_code" VARCHAR(100) NOT NULL,
    "dept_name" VARCHAR(100),
    "company_id" INTEGER NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
