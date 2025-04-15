import { useState } from 'react'

export default function Form({ fields, onSubmit, initialData = {}, submitLabel = 'Submit' }) {
  const [formData, setFormData] = useState(initialData)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({})
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mb-4">
      {fields.map((field) => (
        <input
          key={field}
          name={field}
          placeholder={field}
          value={formData[field] || ''}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
      ))}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        {submitLabel}
      </button>
    </form>
  )
}
