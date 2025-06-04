
import { cn } from '@/lib/utils';

type StatCardProps = {
  title: string;
  value: string | number;
  className?: string;
};

const StatCard = ({ title, value, className }: StatCardProps) => {
  return (
    <div className={cn("bg-gray-300 rounded-xl p-4 shadow-sm", className)}>
      <h3 className="text-sm font-medium text-neutral-dark mb-2">{title}</h3>
      <p className="text-4xl font-display font-semibold text-neutral-dark">{value}</p>
    </div>
  );
};

export default StatCard;
