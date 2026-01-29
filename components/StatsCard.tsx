interface StatsCardProps {
  label: string;
  count: number;
  icon: string;
}

export default function StatsCard({ label, count, icon }: StatsCardProps) {
  return (
    <div className="stat-card">
      <div className="text-4xl mb-4">{icon}</div>
      <div className="text-5xl font-extrabold text-burgundy mb-2 leading-none">
        {count}
      </div>
      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}
