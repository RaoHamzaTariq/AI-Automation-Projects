'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Edit, Trash2, Phone, User } from 'lucide-react'
import { Patient } from '@/lib/types'

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)

  // New patient form state
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: '',
    whatsapp_number: ''
  })

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/patients')
      if (!res.ok) throw new Error('Failed to fetch patients')
      
      const data = await res.json()
      setPatients(data.patients || [])
    } catch (error) {
      console.error('Error fetching patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.whatsapp_number.includes(searchTerm) ||
    patient.patient_id.toString().includes(searchTerm)
  )

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPatient,
          patient_id: Date.now().toString(),
          age: parseInt(newPatient.age)
        })
      })

      if (res.ok) {
        setNewPatient({ name: '', age: '', gender: '', whatsapp_number: '' })
        setShowAddForm(false)
        fetchPatients()
      }
    } catch (error) {
      console.error('Error adding patient:', error)
    }
  }

  const handleDeletePatient = async (patientId: string) => {
    if (!confirm('Are you sure you want to delete this patient?')) return
    
    try {
      const res = await fetch(`/api/patients/${patientId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchPatients()
      }
    } catch (error) {
      console.error('Error deleting patient:', error)
    }
  }

  const handleEditPatient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPatient) return

    try {
      const res = await fetch(`/api/patients/${editingPatient.patient_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPatient.name,
          age: parseInt(newPatient.age),
          gender: newPatient.gender,
          whatsapp_number: newPatient.whatsapp_number
        })
      })

      if (res.ok) {
        setEditingPatient(null)
        setNewPatient({ name: '', age: '', gender: '', whatsapp_number: '' })
        fetchPatients()
      }
    } catch (error) {
      console.error('Error updating patient:', error)
    }
  }

  const startEdit = (patient: Patient) => {
    setEditingPatient(patient)
    setNewPatient({
      name: patient.name,
      age: patient.age.toString(),
      gender: patient.gender,
      whatsapp_number: patient.whatsapp_number
    })
    setShowAddForm(true)
  }

  const cancelForm = () => {
    setShowAddForm(false)
    setEditingPatient(null)
    setNewPatient({ name: '', age: '', gender: '', whatsapp_number: '' })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600 mt-2">Loading patients...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600 mt-2">
            Manage all registered patients ({patients.length} total)
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Add/Edit Patient Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingPatient ? 'Edit Patient' : 'Add New Patient'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingPatient ? handleEditPatient : handleAddPatient} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter patient's full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter age"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <select
                    required
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newPatient.whatsapp_number}
                    onChange={(e) => setNewPatient({...newPatient, whatsapp_number: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 923001234567"
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <Button type="submit">
                  {editingPatient ? 'Update Patient' : 'Add Patient'}
                </Button>
                <Button type="button" variant="outline" onClick={cancelForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Patients</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name, phone, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-80"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPatients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p>No patients found</p>
              {searchTerm && (
                <p className="text-sm mt-2">Try adjusting your search terms</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Patient Info</th>
                    <th className="text-left py-3 px-4">Contact</th>
                    <th className="text-left py-3 px-4">Patient ID</th>
                    <th className="text-left py-3 px-4">Registered</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.patient_id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{patient.name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">
                              {patient.age} years
                            </Badge>
                            <Badge variant="secondary">
                              {patient.gender}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-mono">{patient.whatsapp_number}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {patient.patient_id}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-600">
                          {new Date(patient.created_at).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => startEdit(patient)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeletePatient(patient.patient_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}