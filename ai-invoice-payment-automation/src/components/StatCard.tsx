// components/StatCard.tsx

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  subtitle?: string;
}

export default function StatCard({ title, value, icon, subtitle }: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-4">
        {icon && (
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-xl shadow-lg">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <div className="text-gray-500 text-sm">{title}</div>
          <div className="text-3xl font-bold mt-1">{value}</div>
          {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}
