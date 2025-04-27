'use client'

import { useEffect, useState } from 'react'
import DataTable from './DataTable'
import AddModal from './AddModal'
import EditModal from './EditModal'

const EntityPageLayout = ({ title, endpoint, fields, buttonText = null }) => {
  const [items, setItems] = useState([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/${endpoint}`);
      const json = await res.json();
      setItems(json);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }  

  const handleAddSubmit = async (formData) => {
    await fetch(`/api/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    setIsAddModalOpen(false)
    fetchData()
  }

  const handleEditSubmit = async (formData) => {
    console.log("editingItem", editingItem)
    await fetch(`/api/${endpoint}/${editingItem.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })


    setEditingItem(null)
    fetchData()
  }

  const handleDelete = async (id) => {
    await fetch(`/api/${endpoint}/${id}`, { method: 'DELETE' })
    fetchData()
  }

  const handleEdit = (item) => {
    setEditingItem(item)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="w-full p-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {buttonText || `Add ${title.slice(0, -1)}`}
        </button>
      </div>

      <DataTable 
        data={items} 
        fields={fields} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
        loading={loading}
      />

      {isAddModalOpen && (
        <AddModal
          title={`Add ${title.slice(0, -1)}`}
          fields={fields}
          onSubmit={handleAddSubmit}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {editingItem && (
        <EditModal
          title={`Edit ${title.slice(0, -1)}`}
          fields={fields}
          initialData={editingItem}
          onSubmit={handleEditSubmit}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  )
}

export default EntityPageLayout