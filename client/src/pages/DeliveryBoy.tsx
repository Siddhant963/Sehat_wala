import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import OrderCard, { OrderStatus } from '@/components/ui/OrderCard';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Customer {
  name: string;
  address: string;
  contact: string;
}

interface DeliveryOrder {
  _id: string;
  customer_id: string;
  customer_name: Customer;
  delivery_date: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  delivery_person_id: string;
  __v: number;
}

const DeliveryBoy = () => {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const email = localStorage.getItem('email');
        if (!email) {
          throw new Error('No email found in storage');
        }

        const response = await fetch(
          `http://localhost:3001/api/deliveries/getUserOrder?email=${email}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        
        // Ensure the data is in the correct format
        if (data.data && Array.isArray(data.data)) {
          setOrders(data.data.map((order: any) => ({
            _id: order._id,
            customer_id: order.customer_id,
            customer_name: order.customer_name || { name: 'Unknown', address: '', contact: '' },
            delivery_date: order.delivery_date,
            status: order.status,
            created_at: order.created_at,
            updated_at: order.updated_at,
            delivery_person_id: order.delivery_person_id,
            __v: order.__v
          })));
        } else {
          setOrders([]);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusUpdate = async (deliveryId: string, customerId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/deliveries/updateDelivery?delivery_id=${deliveryId}&customer_id=${customerId}&status=${newStatus}`,
        {
          method: 'post',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      setOrders(orders.map(order => 
        order._id === deliveryId ? { ...order, status: newStatus } : order
      ));
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <header className="bg-neutral-dark text-white p-4 sticky top-0 z-50 shadow-md">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center text-white">
              <ArrowLeft size={20} className="mr-2" />
              <span>Back to Login</span>
            </Link>
            <h1 className="text-lg font-medium">Delivery Mode</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6 animate-fade-in">
          <div className="text-center py-8">Loading orders...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      <header className="bg-neutral-dark text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center text-white">
            <ArrowLeft size={20} className="mr-2" />
            <span>Back to Login</span>
          </Link>
          <h1 className="text-lg font-medium">Delivery Mode</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 animate-fade-in">
        <h1 className="text-2xl font-medium mb-6">Today's Deliveries</h1>
        
        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No deliveries found for today
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <OrderCard 
                key={order._id}
                orderId={order._id}
                customer={order.customer_name?.name || 'Unknown Customer'}
                meal={new Date(order.delivery_date).toLocaleDateString()}
                status={order.status}
                onStatusChange={(newStatus) => 
                  handleStatusUpdate(order._id, order.customer_id, newStatus)
                }
                showAssignButton={false}
                statusOptions={[ 'pending', 'delivered', 'cancelled']}
                additionalInfo={{
                  address: order.customer_name?.address || 'Address not provided',
                  contact: order.customer_name?.contact || 'Contact not provided',
                  deliveryDate: new Date(order.delivery_date).toLocaleString()
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DeliveryBoy;