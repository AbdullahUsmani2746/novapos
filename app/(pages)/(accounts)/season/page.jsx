'use client'

import EntityPageLayout from '@/components/shared/EntityPageLayout'

const SeasonsPage = () => {
  return (
    <EntityPageLayout
      title="Seasons"
      endpoint="seasons"
      fields={[
        { name: 'date_from', label: 'Start Date', fieldType: 'date', required: true },
        { name: 'date_to', label: 'End Date', fieldType: 'date', required: true },
        { name: 'status', label: 'Status', fieldType: 'select', required: true, options: [{
            'value': 'open', 'label': 'Open' }, { 'value': 'closed', 'label': 'Closed'
        }] },
      ]}
      buttonText="Add Season"
    />
  )
}

export default SeasonsPage