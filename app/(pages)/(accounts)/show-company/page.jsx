'use client'

import EntityPageLayout from '@/components/shared/EntityPageLayout'

export default function CompaniesPage() {
  return (
    <EntityPageLayout
      title="Companies"
      endpoint="companies"
      fields={['company', 'addr1', 'addr2', 'city', 'phone', 'fax', 'email']}
    />
  )
}
