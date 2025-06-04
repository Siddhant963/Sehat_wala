
import { cn } from '@/lib/utils';

type InventoryCardProps = {
  totalItems: number;
  available: number;
  used: number;
  className?: string;
  onExpand?: () => void;
};

const InventoryCard = ({ totalItems, available, used, className, onExpand }: InventoryCardProps) => {
  return (
    <div className={cn("card relative mb-4 animate-fade-in", className)}>
      <div className="mb-1">
        <h3 className="text-xl font-medium">Inventory overview</h3>
      </div>
      
      <div className="space-y-1 mb-2">
        <p className="text-sm opacity-90">Total items: {totalItems}</p>
        <p className="text-sm opacity-90">Available: {available}</p>
        <p className="text-sm opacity-90">Used: {used}</p>
      </div>
      
      <div className="absolute bottom-4 right-4">
        <button 
          onClick={onExpand}
          className="bg-teal-600 text-white px-6 py-2 rounded-full text-sm font-medium shadow-sm hover:bg-teal-500 transition-colors"
        >
          Expand
        </button>
      </div>
    </div>
  );
};

export default InventoryCard;
