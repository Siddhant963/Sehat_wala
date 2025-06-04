
import { cn } from '@/lib/utils';

type EmployeeCardProps = {
  name: string;
  role: string;
  salary: number;
  paymentDate?: string;
  className?: string;
};

const EmployeeCard = ({ name, role, salary, paymentDate = "5th", className }: EmployeeCardProps) => {
  return (
    <div className={cn("card flex justify-between items-center mb-2 animate-fade-in", className)}>
      <div>
        <h3 className="font-medium">{name}</h3>
        <p className="text-sm opacity-80">{role}</p>
      </div>
      <div className="text-right">
        <p className="text-xl font-medium">{salary}</p>
        <p className="text-sm opacity-80">{paymentDate}</p>
      </div>
    </div>
  );
};

export default EmployeeCard;
