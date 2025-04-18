'use client'

import EntityPageLayout from '@/components/shared/EntityPageLayout'

const CompaniesPage = () => {
  return (
    <EntityPageLayout
      title="Companies"
      endpoint="companies"
      fields={[
        { name: 'company', label: 'Company', fieldType: 'text' },
        { name: 'addr1', label: 'Address 1', fieldType: 'text' },
        { name: 'addr2', label: 'Address 2', fieldType: 'text' },
        { name: 'city', label: 'City', fieldType: 'text' },
        { name: 'phone', label: 'Phone', fieldType: 'text' },
        { name: 'fax', label: 'Fax', fieldType: 'text' },
        { name: 'email', label: 'Email', fieldType: 'email' },
      ]}
      buttonText="Add Company"
    />
  )
}

export default CompaniesPage