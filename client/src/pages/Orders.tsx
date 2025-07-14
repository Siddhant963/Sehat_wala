import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Customer {
  _id: string;
  name: string;
  contact: string;
  address: string;
}

interface DeliveryPerson {
  _id: string;
  name: string;
  contact: string;
}

interface Delivery {
  _id: string;
  customer_id: Customer;
  delivery_date: string;
  status: 'pending' | 'delivered' | 'cancelled' | 'assigned';
  created_at: string;
  updated_at: string;
  __v: number;
  delivery_person_id?: DeliveryPerson;
  meal_type?: string;
}

interface User {
  _id: string;
  name: string;
  roles: string[];
}

const Orders = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingDelivery, setIsCreatingDelivery] = useState(false);
  const [isAssigningDelivery, setIsAssigningDelivery] = useState(false);
  const [selectedDeliveryIds, setSelectedDeliveryIds] = useState<string[]>([]);
  const [selectedDeliveryPersonId, setSelectedDeliveryPersonId] = useState<string>('');
  const [dateError, setDateError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const [newDelivery, setNewDelivery] = useState({
    meal_type: 'lunch',
    delivery_date: today,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const customersRes = await fetch('http://3.83.158.77:3001/api/admin/getallcoustomers', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const customersData = await customersRes.json();
        setCustomers(customersData.data || []);

        const usersRes = await fetch('http://3.83.158.77:3001/api/admin/getallStaffusers', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const usersData = await usersRes.json();
        setUsers(usersData.data || []);

        await fetchDeliveries();
      } catch (error) {
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchDeliveries = async (status = 'all') => {
    try {
      let url = 'http://3.83.158.77:3001/api/admin/getallDeliveriesbyfilter';
      const formData = new URLSearchParams();

      if (status !== 'all') {
        formData.append('status', status);
      }

      const res = await fetch(`${url}?${formData.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      setDeliveries(data.data || []);
    } catch (error) {
      toast.error('Failed to load deliveries');
      setDeliveries([]);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    
    if (selected < today) {
      setDateError('Selected date cannot be in the past');
    } else {
      setDateError(null);
      setNewDelivery({ ...newDelivery, delivery_date: selectedDate });
    }
  };

  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (dateError) {
      toast.error('Please select a valid date');
      return;
    }

    try {
      setIsCreatingDelivery(true);

      const formData = new URLSearchParams();
      formData.append('meal_type', newDelivery.meal_type);
      formData.append('delivery_date', newDelivery.delivery_date);

      const res = await fetch('http://3.83.158.77:3001/api/admin/createDelivery', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create deliveries');
      }

      toast.success(`${data.message || 'Deliveries created successfully'}`);
      await fetchDeliveries(filterStatus);
      setNewDelivery({
        meal_type: 'lunch',
        delivery_date: today,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create deliveries');
    } finally {
      setIsCreatingDelivery(false);
    }
  };

  const handleAssignDeliveryPerson = async () => {
    try {
      if (!selectedDeliveryPersonId || selectedDeliveryIds.length === 0) {
        throw new Error('Please select a delivery person and at least one delivery');
      }

      setIsAssigningDelivery(true);

      const formData = new URLSearchParams();
      formData.append('delivery_id', selectedDeliveryIds.join(','));
      formData.append('delivery_person_id', selectedDeliveryPersonId);

      const res = await fetch('http://3.83.158.77:3001/api/admin/assignDeliveryPerson', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });

      if (!res.ok) {
        throw new Error('Failed to assign delivery person');
      }

      toast.success('Delivery person assigned successfully');
      await fetchDeliveries(filterStatus);
      setSelectedDeliveryIds([]);
      setSelectedDeliveryPersonId('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to assign delivery person');
    } finally {
      setIsAssigningDelivery(false);
    }
  };

  const toggleDeliverySelection = (deliveryId: string) => {
    setSelectedDeliveryIds(prev => 
      prev.includes(deliveryId) 
        ? prev.filter(id => id !== deliveryId) 
        : [...prev, deliveryId]
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-6 flex items-center justify-center">
          <div className="text-lg">Loading data...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-6 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-medium mb-6">Delivery Management</h1>

        <div className="mb-6">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
                Create Bulk Deliveries
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Create Deliveries for All Customers</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateDelivery}>
                <div className="space-y-4">
                  <div>
                    <Label>Meal Type</Label>
                    <Select
                      value={newDelivery.meal_type}
                      onValueChange={(value) => setNewDelivery({ ...newDelivery, meal_type: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select meal type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={newDelivery.delivery_date}
                      min={today}
                      onChange={handleDateChange}
                      className="w-full"
                    />
                    {dateError && (
                      <p className="text-red-500 text-sm mt-1">{dateError}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isCreatingDelivery || dateError !== null}
                    className="w-full bg-teal-600 hover:bg-teal-700"
                  >
                    {isCreatingDelivery ? 'Creating...' : 'Create Deliveries'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'delivered', 'cancelled', 'assigned'].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                onClick={() => {
                  setFilterStatus(status);
                  fetchDeliveries(status);
                }}
                className="flex-1 sm:flex-none"
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Select
            value={selectedDeliveryPersonId}
            onValueChange={setSelectedDeliveryPersonId}
          >
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Select delivery person" />
            </SelectTrigger>
            <SelectContent>
              {users.map(user => (
                <SelectItem key={user._id} value={user._id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAssignDeliveryPerson}
            disabled={isAssigningDelivery || selectedDeliveryIds.length === 0 || !selectedDeliveryPersonId}
            className="w-full sm:w-auto"
          >
            {isAssigningDelivery ? 'Assigning...' : `Assign ${selectedDeliveryIds.length} Delivery(ies)`}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {deliveries.map((delivery) => {
            const deliveryDate = new Date(delivery.delivery_date).toLocaleDateString();
            const createdAt = new Date(delivery.created_at).toLocaleString();
            
            return (
              <div key={delivery._id} className="border rounded-lg p-4 shadow-sm relative">
                <div className="absolute top-2 right-2">
                  <input
                    type="checkbox"
                    checked={selectedDeliveryIds.includes(delivery._id)}
                    onChange={() => toggleDeliverySelection(delivery._id)}
                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm sm:text-base">
                      <strong>Customer:</strong> {delivery.customer_id?.name || 'N/A'}
                    </p>
                    <p className="text-sm sm:text-base">
                      <strong>Contact:</strong> {delivery.customer_id?.contact || 'N/A'}
                    </p>
                    <p className="text-sm sm:text-base">
                      <strong>Address:</strong> {delivery.customer_id?.address || 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    {delivery.meal_type && (
                      <p className="text-sm sm:text-base">
                        <strong>Meal Type:</strong> {delivery.meal_type}
                      </p>
                    )}
                    <p className="text-sm sm:text-base">
                      <strong>Delivery Date:</strong> {deliveryDate}
                    </p>
                    <p className="text-sm sm:text-base">
                      <strong>Status:</strong> 
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                        delivery.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        delivery.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        delivery.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {delivery.status}
                      </span>
                    </p>
                    <p className="text-sm sm:text-base">
                      <strong>Created:</strong> {createdAt}
                    </p>
                  </div>
                </div>

                {delivery.delivery_person_id && (
                  <div className="mt-2 border-t pt-2">
                    <p className="text-sm sm:text-base">
                      <strong>Delivery Person:</strong> {delivery.delivery_person_id.name}
                    </p>
                    <p className="text-sm sm:text-base">
                      <strong>DP Contact:</strong> {delivery.delivery_person_id.contact}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Orders;