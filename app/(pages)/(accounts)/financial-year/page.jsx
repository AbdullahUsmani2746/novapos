'use client'

import EntityPageLayout from '@/components/shared/EntityPageLayout'

const FinancialYearsPage = () => {
  return (
    <EntityPageLayout
      title="Financial Years"
      endpoint="financial-years"
      fields={[
        { name: 'date_from', label: 'Start Date', fieldType: 'date' },
        { name: 'date_to', label: 'End Date', fieldType: 'date' },
        { name: 'status', label: 'Status', fieldType: 'select', options: [{
            'value': 'open', 'label': 'Open' }, { 'value': 'closed', 'label': 'Closed'
        }] },
      ]}
      buttonText="Add Financial Year"
    />
  )
}

export default FinancialYearsPage