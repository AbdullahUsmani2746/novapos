'use client'

import EntityPageLayout from '@/components/shared/EntityPageLayout'

const CompaniesPage = () => {
  return (
    <EntityPageLayout
      title="Companies"
      endpoint="companies"
      fields={['company', 'addr1', 'addr2', 'city', 'phone', 'fax', 'email']}
    />
  )
}

export default CompaniesPage