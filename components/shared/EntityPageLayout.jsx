'use client'

import { useEffect, useState } from 'react'
import DataTable from './DataTable'
import AddModal from './AddModal'
import EditModal from './EditModal'
import axios from 'axios'

const EntityPageLayout = ({ title, endpoint, fields, buttonText = null }) => {
  const [items, setItems] = useState([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [loading, setLoading] = useState(false)

  const [page, setPage] = useState(1);
  const limit = 1; 
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`/api/setup/${endpoint}`)
      setItems(res.data.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleAddSubmit = async (formData) => {
    try {
      await axios.post(`/api/${endpoint}`, formData)
      setIsAddModalOpen(false)
      fetchData()
    } catch (error) {
      console.error('Error adding data:', error)
    }
  }

  const handleEditSubmit = async (formData) => {
    try {
      console.log("editingItem", editingItem)
      await axios.put(`/api/${endpoint}/${editingItem.id}`, formData)
      setEditingItem(null)
      fetchData()
    } catch (error) {
      console.error('Error editing data:', error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/${endpoint}/${id}`)
      fetchData()
    } catch (error) {
      console.error('Error deleting data:', error)
    }
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
        page={page}
        setPage={setPage}
        limit={limit}
        total={total}
        setTotal={setTotal}
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