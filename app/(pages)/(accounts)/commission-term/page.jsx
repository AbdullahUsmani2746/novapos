'use client'

import EntityPageLayout from '@/components/shared/EntityPageLayout'

const CommissionTerms = () => {
  return (
    <EntityPageLayout
      title="Commission Terms"
      endpoint="commission-terms"
      fields={[
        { name: 'commission_term', label: 'Commission Term', fieldType: 'text', required: true },
      ]}
      buttonText="Add Commission Term"
    />
  )
}

export default CommissionTerms