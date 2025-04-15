'use client'

import { useEffect, useState } from 'react'
import Form from './Form'
import DataTable from './DataTable'

export default function EntityPageLayout({ title, endpoint, fields }) {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)

  const fetchData = async () => {
    const res = await fetch(`/api/${endpoint}`)
    const json = await res.json()
    setItems(json)
  }

  const handleSubmit = async (formData) => {
    const method = editing ? 'PUT' : 'POST'
    const url = editing ? `/api/${endpoint}/${editing.id}` : `/api/${endpoint}`

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    setEditing(null)
    fetchData()
  }

  const handleDelete = async (id) => {
    await fetch(`/api/${endpoint}/${id}`, { method: 'DELETE' })
    fetchData()
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <Form fields={fields} initialData={editing} onSubmit={handleSubmit} submitLabel={`Save ${title}`} />
      <DataTable data={items} fields={fields} onEdit={setEditing} onDelete={handleDelete} />
    </div>
  )
}
