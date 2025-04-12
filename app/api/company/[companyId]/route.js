import { NextResponse } from 'next/server';
import { getCompany, updateCompany, deleteCompany } from '@/actions/company.actions';

exports.GET = async (req, { params }) => {
  try {
    const company = await getCompany(params.companyId);
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    return NextResponse.json(company);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

exports.PUT = async (req, { params }) => {
  try {
    const body = await req.json();
    const company = await updateCompany(params.companyId, body);
    return NextResponse.json(company);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
};

exports.DELETE = async (req, { params }) => {
  try {
    await deleteCompany(params.companyId);
    return NextResponse.json({ message: 'Company deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};