import { useState } from 'react'
import Modal from './Modal'

const AddModal = ({ title, fields, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({})

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({})
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name} className="space-y-1">
            <label htmlFor={field.label} className="block text-sm font-medium text-gray-700">
              {field.label?.charAt(0).toUpperCase() + field.label.slice(1)}
            </label>
            <input
              id={field.name}
              name={field.name}
              value={formData[field?.name] || ''}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
          </div>
        ))}
        <div className="flex space-x-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AddModal