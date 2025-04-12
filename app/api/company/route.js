import { NextResponse } from "next/server";
import { createCompany, getCompanies } from "@/actions/company.actions";

export async function POST(req) {
  try {
    const body = await req.json();
    const company = await createCompany(body);
    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET() {
  try {
    const companies = await getCompanies();
    return NextResponse.json(companies);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
