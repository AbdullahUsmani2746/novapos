'use client'

import EntityPageLayout from '@/components/shared/EntityPageLayout'

const PoPrdCategories = () => {
  return (
    <EntityPageLayout
      title="PO Product Categories"
      endpoint="po-prd-cats"
      fields={[
        { name: 'category_name', label: 'Category Name', fieldType: 'text' },
      ]}
      buttonText="Add PO Product Category"
    />
  )
}

export default PoPrdCategories