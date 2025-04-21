'use client'

import EntityPageLayout from '@/components/shared/EntityPageLayout'

const DeliveryTerms = () => {
  return (
    <EntityPageLayout
      title="Delivery Terms"
      endpoint="delivery-terms"
      fields={[
        { name: 'delivery_term', label: 'Delivery Term', fieldType: 'text', required: true },
      ]}
      buttonText="Add Delivery Term"
    />
  )
}

export default DeliveryTerms