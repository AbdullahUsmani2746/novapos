'use client'

import EntityPageLayout from '@/components/shared/EntityPageLayout'

const CompaniesPage = () => {
  return (
    <EntityPageLayout
      title="Companies"
      endpoint="companies"
      fields={[
        { name: 'company', label: 'Company', fieldType: 'text', required: true },
        { name: 'addr1', label: 'Address 1', fieldType: 'text', required: true },
        { name: 'addr2', label: 'Address 2', fieldType: 'text' },
        { name: 'city', label: 'City', fieldType: 'text', required: true },
        { name: 'phone', label: 'Phone', fieldType: 'text', required: true },
        { name: 'fax', label: 'Fax', fieldType: 'text' },
        { name: 'email', label: 'Email', fieldType: 'email', required: true },
      ]}
      buttonText="Add Company"
    />
  )
}

export default CompaniesPage