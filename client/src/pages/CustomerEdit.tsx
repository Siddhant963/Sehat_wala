import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Customer {
  _id: string;
  name: string;
  email: string;
  contact: string;
  address: string;
  subscription: string;
  subscription_start_date: string;
  subscription_end_date: string;
  status?: 'Active' | 'Inactive';
  mealsLeft?: number;
  rating?: number;
  meals: string;
  meals_timeing: string;
  payment: string;
}

const CustomerEdit = () => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch customer data
        const customerResponse = await fetch(
          `http://3.83.158.77:3001/api/admin/getallcoustomersbyfillter?_id=${id}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!customerResponse.ok) {
          throw new Error('Failed to fetch customer data');
        }

        const customerData = await customerResponse.json();
        if (!customerData.data || customerData.data.length === 0) {
          throw new Error('Customer not found');
        }

        setCustomer(customerData.data[0]);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'An error occurred');
        navigate('/customers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomer(prev => prev ? { ...prev, [name]: value } : null);
    setErrors(prev => ({ ...prev, [name]: '' })); // Clear error on change
  };

  const handlePaymentChange = (value: string) => {
    setCustomer(prev => prev ? { ...prev, payment: value } : null);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!customer) return newErrors;

    // Name validation
    if (!/^[a-zA-Z\s]+$/.test(customer.name)) {
      newErrors.name = 'Name must contain only letters and spaces.';
    }

    // Email validation
    if (!/\S+@\S+\.\S+/.test(customer.email)) {
      newErrors.email = 'Email is invalid.';
    }

    // Date validation
    const startDate = new Date(customer.subscription_start_date);
    const endDate = new Date(customer.subscription_end_date);
    if (startDate >= endDate) {
      newErrors.subscription_end_date = 'End date must be after start date.';
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) return;

    if (!customer) return;

    try {
      setIsSubmitting(true);
      const response = await fetch('http://3.83.158.77:3001/api/admin/updateCoustomer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          _id: customer._id,
          name: customer.name,
          email: customer.email,
          contact: customer.contact,
          address: customer.address,
          subscription: customer.subscription,
          subscription_start_date: customer.subscription_start_date,
          subscription_end_date: customer.subscription_end_date,
          meals: customer.meals,
          meals_timing: customer.meals_timeing,
          payment: customer.payment
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update customer');
      }

      toast.success('Customer updated successfully');
      navigate('/customers');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-6 flex items-center justify-center">
          <div className="text-lg">Loading customer data...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-6 flex items-center justify-center">
          <div className="text-red-500">Customer not found</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6 animate-fade-in">
        <div className="mb-6">
          <Link to="/customers" className="flex items-center text-neutral-dark">
            <ArrowLeft size={20} className="mr-2" />
            <span>Back to Customers</span>
          </Link>
        </div>
        <div className="card">
          <div className="bg-neutral-dark text-white p-4 mb-6">
            <h1 className="text-xl font-medium text-center">Edit Customer</h1>
          </div>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  name="name"
                  placeholder="Full Name"
                  value={customer.name}
                  onChange={handleChange}
                  className={`bg-gray-400 p-4 h-14 ${errors.name ? 'border-red-500' : ''}`}
                  required
                />
                {errors.name && <div className="text-red-500">{errors.name}</div>}
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  name="email"
                  placeholder="Email"
                  type="email"
                  value={customer.email}
                  onChange={handleChange}
                  className={`bg-gray-400 p-4 h-14 ${errors.email ? 'border-red-500' : ''}`}
                  required
                />
                {errors.email && <div className="text-red-500">{errors.email}</div>}
              </div>
              <div>
                <Label>Contact Number</Label>
                <Input
                  name="contact"
                  placeholder="Contact Number"
                  value={customer.contact}
                  onChange={handleChange}
                  className="bg-gray-400 p-4 h-14"
                  required
                />
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  name="address"
                  placeholder="Address"
                  value={customer.address}
                  onChange={handleChange}
                  className="bg-gray-400 p-4 h-14"
                  required
                />
              </div>
              <div>
                <Label>Subscription</Label>
                <Input
                  name="subscription"
                  placeholder="Subscription"
                  value={customer.subscription}
                  onChange={handleChange}
                  className="bg-gray-400 p-4 h-14"
                  required
                />
              </div>
              <div>
                <Label>Subscription Start Date</Label>
                <Input
                  name="subscription_start_date"
                  type="date"
                  value={customer.subscription_start_date.split('T')[0]}
                  onChange={handleChange}
                  className="bg-gray-400 p-4 h-14"
                />
              </div>
              <div>
                <Label>Subscription End Date</Label>
                <Input
                  name="subscription_end_date"
                  type="date"
                  value={customer.subscription_end_date.split('T')[0]}
                  onChange={handleChange}
                  className={`bg-gray-400 p-4 h-14 ${errors.subscription_end_date ? 'border-red-500' : ''}`}
                />
                {errors.subscription_end_date && <div className="text-red-500">{errors.subscription_end_date}</div>}
              </div>
              <div>
                <Label>Meals</Label>
                <Input
                  name="meals"
                  placeholder="Meals (e.g., 2 meals per day)"
                  value={customer.meals || ''}
                  onChange={handleChange}
                  className="bg-gray-400 p-4 h-14"
                  required
                />
              </div>
              <div>
                <Label>Meals Timing</Label>
                <Input
                  name="meals_timeing"
                  placeholder="Meals_type (e.g., lunch, dinner)"
                  value={customer.meals_timeing || ''}
                  onChange={handleChange}
                  className="bg-gray-400 p-4 h-14"
                  required
                />
              </div>
              <div>
                <Label>Payment Status</Label>
                <Select
                  value={customer.payment || 'Pending'}
                  onValueChange={handlePaymentChange}
                >
                  <SelectTrigger className="bg-gray-400 p-4 h-14">
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Done">Done</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="border-t border-b py-4 my-6">
              <h3 className="text-xl font-medium mb-4">Meals left</h3>
              <div className="text-3xl text-center">
                {customer.meals}
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-teal-600 text-white p-4 rounded-full text-xl font-medium disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Customer'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerEdit;
