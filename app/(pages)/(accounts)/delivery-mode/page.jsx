'use client'

import EntityPageLayout from '@/components/shared/EntityPageLayout'

const DeliveryModes = () => {
  return (
    <EntityPageLayout
      title="Delivery Modes"
      endpoint="delivery-modes"
      fields={[
        { name: 'delivery_mode', label: 'Delivery Mode', fieldType: 'text', required: true },
        { name: 'rate_kg', label: 'Rate', fieldType: 'number', required: true },
      ]}
      buttonText="Add Delivery Mode"
    />
  )
}

export default DeliveryModes