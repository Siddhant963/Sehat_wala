
import { cn } from '@/lib/utils';

type CustomerCardProps = {
  name: string;
  location: string;
  joinDate: string;
  mealsLeft: number;
  status: 'Active' | 'Inactive';
  className?: string;
  onEdit?: () => void;
  onTerminate?: () => void;
  onRenew?: () => void;
  onRemove?: () => void;
};

const CustomerCard = ({ 
  name, 
  location, 
  joinDate, 
  mealsLeft, 
  status, 
  className,
  onEdit,
  onTerminate,
  onRenew,
  onRemove

}: CustomerCardProps) => {
  return (
    <div className={cn("card relative mb-4 animate-fade-in", className)}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">{name}</h3>
          <p className="text-xs opacity-80">Location: {location}</p>
          <p className="text-xs opacity-80">Joined: {joinDate}</p>
          <p className="text-xs opacity-80">Meals Left: {mealsLeft}</p>
        </div>
        <div className="flex flex-col gap-2">
          <button 
            onClick={onEdit}
            className="bg-white text-neutral-dark px-4 py-1 rounded-full text-sm shadow-sm hover:bg-gray-100 transition-colors"
          >
            Edit
          </button>
          
          <button 
            onClick={onRemove}
            className="bg-white text-neutral-dark px-4 py-1 rounded-full text-sm shadow-sm hover:bg-gray-100 transition-colors"
          >
            Remove
          </button>
          
        </div>
      </div>
      
    </div>
  );
};

export default CustomerCard;
