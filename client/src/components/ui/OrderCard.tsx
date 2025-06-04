import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useState } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type OrderStatus = 'Pending' | 'Delivered' | 'ND IOT' | 'ND IL' | 'Taken Extra Tiffin' | 'assigned';

type OrderCardProps = {
  orderId: string;
  customer: string;
  meal: string;
  status: OrderStatus;
  className?: string;
  onStatusChange?: (status: OrderStatus) => void;
  additionalInfo?: {
    address?: string;
    contact?: string;
    deliveryDate?: string;
    createdDate?: string;
  };
  showAssignButton?: boolean;
  statusOptions?: OrderStatus[];
};

const OrderCard = ({ 
  orderId, 
  customer, 
  meal, 
  status: initialStatus, 
  className, 
  onStatusChange,
  additionalInfo,
  showAssignButton = true,
  statusOptions = ['Pending', 'Delivered', 'ND IOT', 'ND IL', 'Taken Extra Tiffin', 'assigned']
}: OrderCardProps) => {
  const [status, setStatus] = useState<OrderStatus>(initialStatus);

  const handleUpdateStatus = (newStatus: OrderStatus) => {
    setStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
    toast.success(`Order status updated to: ${newStatus}`);
  };

  const handleAssignDelivery = () => {
    toast.success('Delivery assigned');
  };

  // Get status color based on status
  const getStatusColor = (status: OrderStatus) => {
    switch(status) {
      case 'Delivered':
        return 'text-green-600';
      case 'ND IOT':
      case 'ND IL':
        return 'text-red-600';
      case 'Taken Extra Tiffin':
        return 'text-orange-600';
      case 'assigned':
        return 'text-purple-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className={cn("bg-white p-6 rounded-lg shadow-md mb-4 animate-fade-in", className)}>
      <div className="mb-4">
        <h3 className="text-xl font-bold text-neutral-800">Order #{orderId.slice(-6).toUpperCase()}</h3>
        <div className="mt-3 space-y-2">
          <div className="flex items-start">
            <span className="font-medium text-neutral-700 w-24">Customer:</span>
            <span className="text-neutral-600">{customer}</span>
          </div>
          
          {additionalInfo?.address && (
            <div className="flex items-start">
              <span className="font-medium text-neutral-700 w-24">Address:</span>
              <span className="text-neutral-600">{additionalInfo.address}</span>
            </div>
          )}
          
          {additionalInfo?.contact && (
            <div className="flex items-start">
              <span className="font-medium text-neutral-700 w-24">Contact:</span>
              <span className="text-neutral-600">{additionalInfo.contact}</span>
            </div>
          )}
          
          <div className="flex items-start">
            <span className="font-medium text-neutral-700 w-24">Meal Date:</span>
            <span className="text-neutral-600">{meal}</span>
          </div>
          
          {additionalInfo?.deliveryDate && (
            <div className="flex items-start">
              <span className="font-medium text-neutral-700 w-24">Delivery Date:</span>
              <span className="text-neutral-600">{additionalInfo.deliveryDate}</span>
            </div>
          )}
          
          {additionalInfo?.createdDate && (
            <div className="flex items-start">
              <span className="font-medium text-neutral-700 w-24">Created:</span>
              <span className="text-neutral-600">{additionalInfo.createdDate}</span>
            </div>
          )}
          
          <div className="flex items-start">
            <span className="font-medium text-neutral-700 w-24">Status:</span>
            <span className={`font-medium ${getStatusColor(status)}`}>{status}</span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-4">
        <div className="w-full mr-2">
          <Select
            value={status}
            onValueChange={(value) => handleUpdateStatus(value as OrderStatus)}
          >
            <SelectTrigger className="w-full bg-white text-neutral-dark px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-50 transition-colors border border-gray-200">
              <SelectValue placeholder="Update status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {showAssignButton && (
          <button 
            onClick={handleAssignDelivery}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-teal-500 transition-colors ml-2"
          >
            Assign
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;