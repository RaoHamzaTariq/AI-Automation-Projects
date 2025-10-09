'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from 'react'
import { Appointment } from '@/lib/types'

export function AppointmentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    fetchAppointments()
  }, [currentDate])

  const fetchAppointments = async () => {
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      const firstDay = new Date(year, month - 1, 1)
      const lastDay = new Date(year, month, 0)
      
      // Fetch appointments for the current month
      const res = await fetch(`/api/appointments`)
      const data = await res.json()
      setAppointments(data.appointments || [])
    } catch (error) {
      console.error('Error fetching appointments for calendar:', error)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    
    // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay()
    
    // Create empty cells for days before the first day of month
    const emptyCells = Array.from({ length: firstDayOfWeek }, (_, i) => ({
      empty: true,
      day: 0
    }))
    
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayAppointments = appointments.filter(apt => apt.date === dateString)
      
      return {
        date: dateString,
        day,
        appointments: dayAppointments,
        empty: false
      }
    })
    
    return [...emptyCells, ...days]
  }

  const days = getDaysInMonth(currentDate)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="p-2 hover:bg-gray-100 rounded"
          >
            ←
          </button>
          <h3 className="font-semibold">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="p-2 hover:bg-gray-100 rounded"
          >
            →
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map(({ date, day, appointments: dayAppointments, empty }, index) => (
            <div
              key={index}
              className={`min-h-20 p-1 border rounded ${
                empty 
                  ? 'bg-gray-50 border-gray-100' 
                  : date === new Date().toISOString().split('T')[0] 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'border-gray-200'
              }`}
            >
              {!empty && (
                <>
                  <div className="text-sm font-medium mb-1">{day}</div>
                  {dayAppointments.slice(0, 2).map((apt: { time: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; patient: { name: string } }, aptIndex: Key | null | undefined) => (
                    <div
                      key={aptIndex}
                      className="text-xs bg-green-100 text-green-800 rounded px-1 py-0.5 mb-1 truncate"
                      title={`${apt.time} - ${apt.patient?.name}`}
                    >
                      {apt.time} - {apt.patient?.name?.split(' ')[0]}
                    </div>
                  ))}
                  {dayAppointments.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayAppointments.length - 2} more
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}