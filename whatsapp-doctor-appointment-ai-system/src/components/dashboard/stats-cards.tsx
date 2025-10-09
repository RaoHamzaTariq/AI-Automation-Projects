'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Users, DollarSign, Activity } from 'lucide-react'

interface StatsCardsProps {
  stats: {
    totalAppointments: number
    todayAppointments: number
    totalPatients: number
    revenue: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Appointments',
      value: stats.totalAppointments,
      icon: Calendar,
      description: 'All time appointments',
      color: 'bg-blue-500'
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      icon: Activity,
      description: 'Appointments for today',
      color: 'bg-green-500'
    },
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: Users,
      description: 'Registered patients',
      color: 'bg-purple-500'
    },
    {
      title: 'Revenue',
      value: `$${stats.revenue}`,
      icon: DollarSign,
      description: 'Total revenue',
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {card.title}
                </p>
                <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {card.description}
                </p>
              </div>
              <div className={`p-3 rounded-full ${card.color}`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}