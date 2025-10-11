'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Appointment } from '@/lib/types'
import { format, formatDistanceToNow } from 'date-fns'

interface RecentAppointmentsProps {
  appointments: Appointment[]
}

export function RecentAppointments({ appointments }: RecentAppointmentsProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'default'
      case 'Cancelled':
        return 'destructive'
      case 'Completed':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getPaymentVariant = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'default'
      case 'Pending':
        return 'outline'
      case 'Refunded':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const formatCreatedAt = (createdAt: string) => {
    try {
      const date = new Date(createdAt)
      const now = new Date()
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
      
      if (diffInHours < 24) {
        return formatDistanceToNow(date, { addSuffix: true })
      } else {
        return format(date, 'MMM dd, yyyy HH:mm')
      }
    } catch (error) {
      return 'Unknown date'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Appointments</CardTitle>
        <p className="text-sm text-gray-500 font-normal">
          Sorted by creation time (newest first)
        </p>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No recent appointments found</p>
            <p className="text-sm mt-2">Appointments will appear here as they are booked</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.appointment_id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {appointment.patient?.name || 'Unknown Patient'}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-sm text-gray-600">
                          📅 {appointment.date} at {appointment.time}
                        </p>
                        <p className="text-xs text-gray-400">
                          🕒 {formatCreatedAt(appointment.created_at)}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        📞 {appointment.whatsapp_number}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2 ml-4">
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusVariant(appointment.status)}>
                      {appointment.status}
                    </Badge>
                    <Badge variant={getPaymentVariant(appointment.payment_status)}>
                      {appointment.payment_status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">
                      {appointment.payment_method}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}