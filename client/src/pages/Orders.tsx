import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
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
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const [selectedDeliveryPersonId, setSelectedDeliveryPersonId] = useState<string>('');

  const [newDelivery, setNewDelivery] = useState({
    meal_type: 'lunch',
    delivery_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const customersRes = await fetch('http://localhost:3001/api/admin/getallcoustomers', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const customersData = await customersRes.json();
        setCustomers(customersData.data || []);

        const usersRes = await fetch('http://localhost:3001/api/admin/getallusers', {
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
      let url = 'http://localhost:3001/api/admin/getallDeliveriesbyfilter';
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

  const handleCreateDelivery = async () => {
    try {
      setIsCreatingDelivery(true);

      const formData = new URLSearchParams();
      formData.append('meal_type', newDelivery.meal_type);
      formData.append('delivery_date', newDelivery.delivery_date);

      const res = await fetch('http://localhost:3001/api/admin/createDelivery', {
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

      toast.success(`Successfully created ${data.count || 0} deliveries`);
      await fetchDeliveries(filterStatus);
      setNewDelivery({
        meal_type: 'lunch',
        delivery_date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create deliveries');
    } finally {
      setIsCreatingDelivery(false);
    }
  };

  const handleAssignDeliveryPerson = async (deliveryId: string) => {
    try {
      if (!selectedDeliveryPersonId) {
        throw new Error('Please select a delivery person');
      }

      setIsAssigningDelivery(true);

      const formData = new URLSearchParams();
      formData.append('delivery_id', deliveryId);
      formData.append('delivery_person_id', selectedDeliveryPersonId);

      const res = await fetch('http://localhost:3001/api/admin/assignDeliveryPerson', {
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
      setSelectedDeliveryId(null);
      setSelectedDeliveryPersonId('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to assign delivery person');
    } finally {
      setIsAssigningDelivery(false);
    }
  };

  const chartData = [
    { name: 'Pending', value: deliveries.filter(d => d.status === 'pending').length },
    { name: 'Delivered', value: deliveries.filter(d => d.status === 'delivered').length },
    { name: 'Cancelled', value: deliveries.filter(d => d.status === 'cancelled').length },
    { name: 'Assigned', value: deliveries.filter(d => d.status === 'assigned').length },
  ].filter(item => item.value > 0);

  const COLORS = ['#00C4C4', '#4CAF50', '#FF6B6B', '#6366F1'];

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
                    onChange={(e) => setNewDelivery({ ...newDelivery, delivery_date: e.target.value })}
                    className="w-full"
                  />
                </div>

                <Button
                  onClick={handleCreateDelivery}
                  disabled={isCreatingDelivery}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                >
                  {isCreatingDelivery ? 'Creating...' : 'Create Deliveries'}
                </Button>
              </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-4">Delivery Summary</h2>
            <div className="w-full h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="w-full">
            <h2 className="text-xl font-semibold mb-4">Recent Deliveries</h2>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {deliveries.map((delivery) => {
                const deliveryDate = new Date(delivery.delivery_date).toLocaleDateString();
                const createdAt = new Date(delivery.created_at).toLocaleString();
                
                return (
                  <div key={delivery._id} className="border rounded-lg p-3 sm:p-4 shadow-sm">
                    <p className="text-sm sm:text-base">
                      <strong>Customer:</strong> {delivery.customer_id?.name || 'N/A'}
                    </p>
                    <p className="text-sm sm:text-base">
                      <strong>Contact:</strong> {delivery.customer_id?.contact || 'N/A'}
                    </p>
                    <p className="text-sm sm:text-base">
                      <strong>Address:</strong> {delivery.customer_id?.address || 'N/A'}
                    </p>

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

                    {delivery.delivery_person_id ? (
                      <div className="mt-2">
                        <p className="text-sm sm:text-base">
                          <strong>Delivery Person:</strong> {delivery.delivery_person_id.name}
                        </p>
                        <p className="text-sm sm:text-base">
                          <strong>DP Contact:</strong> {delivery.delivery_person_id.contact}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2">
                        <Select
                          value={selectedDeliveryId === delivery._id ? selectedDeliveryPersonId : ''}
                          onValueChange={(value) => {
                            setSelectedDeliveryId(delivery._id);
                            setSelectedDeliveryPersonId(value);
                          }}
                        >
                          <SelectTrigger className="w-full sm:w-[180px]">
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
                          onClick={() => handleAssignDeliveryPerson(delivery._id)}
                          disabled={isAssigningDelivery || selectedDeliveryId !== delivery._id}
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          {isAssigningDelivery && selectedDeliveryId === delivery._id ? 'Assigning...' : 'Assign'}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Orders;