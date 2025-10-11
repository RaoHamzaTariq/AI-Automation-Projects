'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { Appointment } from '@/lib/types'

interface CalendarDay {
  date: string
  day: number
  appointments: Appointment[]
  isEmpty: boolean
}

export function AppointmentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    fetchAppointments()
  }, [currentDate])

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`/api/appointments`)
      const data = await res.json()
      setAppointments(data.appointments || [])
    } catch (error) {
      console.error('Error fetching appointments for calendar:', error)
    }
  }

  const getCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: CalendarDay[] = []

    // Add empty days for the beginning of the calendar
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({
        date: '',
        day: 0,
        appointments: [],
        isEmpty: true
      })
    }

    // Add actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayAppointments = appointments.filter(apt => apt.date === dateString)
      
      days.push({
        date: dateString,
        day,
        appointments: dayAppointments,
        isEmpty: false
      })
    }

    return days
  }

  const calendarDays = getCalendarDays()

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
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`min-h-20 p-1 border rounded ${
                day.isEmpty 
                  ? 'bg-gray-50 border-gray-100' 
                  : day.date === new Date().toISOString().split('T')[0] 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'border-gray-200'
              }`}
            >
              {!day.isEmpty && (
                <>
                  <div className="text-sm font-medium mb-1">{day.day}</div>
                  {day.appointments.slice(0, 2).map((apt, aptIndex) => (
                    <div
                      key={`${day.date}-${aptIndex}`}
                      className="text-xs bg-green-100 text-green-800 rounded px-1 py-0.5 mb-1 truncate"
                      title={`${apt.time} - ${apt.patient?.name}`}
                    >
                      {apt.time} - {apt.patient?.name?.split(' ')[0]}
                    </div>
                  ))}
                  {day.appointments.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{day.appointments.length - 2} more
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