'use client'

import EntityPageLayout from '@/components/shared/EntityPageLayout'

export default function CompaniesPage() {
  return (
    <EntityPageLayout
      title="Companies"
      endpoint="companies"
      fields={['name', 'address1', 'address2', 'city', 'phone', 'fax', 'email']}
    />
  )
}
