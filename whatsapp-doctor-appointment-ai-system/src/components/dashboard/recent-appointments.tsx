'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Appointment } from '@/lib/types'

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.appointment_id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="font-medium text-gray-900">
                    {appointment.patient?.name || 'Unknown Patient'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {appointment.date} at {appointment.time}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={getStatusVariant(appointment.status)}>
                  {appointment.status}
                </Badge>
                <Badge variant={getPaymentVariant(appointment.payment_status)}>
                  {appointment.payment_status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}