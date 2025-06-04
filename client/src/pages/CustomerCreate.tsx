import { useState } from 'react';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CustomerCreate = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    address: '',
    subscription: '',
    subscription_start_date: '',
    subscription_end_date: '',
    meals: '',
    meals_timeing: '',
    payment: 'Pending' // Default to Pending
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      payment: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requiredFields = ['name', 'email', 'contact', 'subscription'];
    const missingField = requiredFields.find(field => !formData[field as keyof typeof formData]);
     console.log(missingField);
     
    if (missingField) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('http://localhost:3001/api/admin/AddCoustomer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create customer');
      }

      toast.success('Customer created successfully');
      navigate('/customers');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <h1 className="text-xl font-medium text-center">Customer Creation</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <h2 className="text-2xl font-medium mb-4">Customer details</h2>

            <div className="space-y-4">
              <Input
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="bg-gray-200 p-4 h-14"
                required
              />

              <Input
                name="email"
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="bg-gray-200 p-4 h-14"
                required
              />

              <Input
                name="contact"
                placeholder="Contact Number"
                value={formData.contact}
                onChange={handleChange}
                className="bg-gray-200 p-4 h-14"
                required
              />

              <Input
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                className="bg-gray-200 p-4 h-14"
                required
              />

              <Input
                name="subscription"
                placeholder="Subscription (e.g., 60 days)"
                value={formData.subscription}
                onChange={handleChange}
                className="bg-gray-200 p-4 h-14"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subscription_start_date">Subscription Start Date</Label>
                  <Input
                    name="subscription_start_date"
                    type="date"
                    value={formData.subscription_start_date}
                    onChange={handleChange}
                    className="bg-gray-200 p-4 h-14 w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="subscription_end_date">Subscription End Date</Label>
                  <Input
                    name="subscription_end_date"
                    type="date"
                    value={formData.subscription_end_date}
                    onChange={handleChange}
                    className="bg-gray-200 p-4 h-14 w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    name="meals"
                    placeholder="Total Meals"
                    value={formData.meals}
                    onChange={handleChange}
                    className="bg-gray-200 p-4 h-14 w-full"
                  />
                </div>
                <div>
                  <Input
                    name="meals_timeing"
                    placeholder="Meal Timing (e.g., lunch, dinner)"
                    value={formData.meals_timeing}
                    onChange={handleChange}
                    className="bg-gray-200 p-4 h-14 w-full"
                  />
                </div>
              </div>

              <div>
                <Label>Payment Status</Label>
                <Select 
                  value={formData.payment} 
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger className="bg-gray-200 p-4 h-14 w-full">
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Done">Done</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-teal-600 text-white p-4 rounded-full text-xl font-medium disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Customer'}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CustomerCreate;