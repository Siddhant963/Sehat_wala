import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CustomerCreate = () => {
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    address: '',
    subscription: '',
    subscription_start_date: today, // Default to today
    subscription_end_date: '',
    meals: '',
    meals_timeing: '',
    payment: 'Pending',
    remainingAmount: '' // Added remaining amount field
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    contact: '',
    subscription: '',
    subscription_start_date: '',
    subscription_end_date: '',
    meals: '',
    meals_timeing: '',
    remainingAmount: '' // Added error field for remaining amount
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Validate dates when they change
  useEffect(() => {
    const newErrors = {...errors};
    
    // Validate end date against start date
    if (formData.subscription_start_date && formData.subscription_end_date) {
      const startDate = new Date(formData.subscription_start_date);
      const endDate = new Date(formData.subscription_end_date);
      
      if (endDate < startDate) {
        newErrors.subscription_end_date = 'End date cannot be before start date';
      } else {
        newErrors.subscription_end_date = '';
      }
    }

    // Validate remaining amount when payment is Pending
    if (formData.payment === 'Pending' && !formData.remainingAmount) {
      newErrors.remainingAmount = 'Remaining amount is required for pending payments';
    } else {
      newErrors.remainingAmount = '';
    }

    setErrors(newErrors);
  }, [formData.subscription_start_date, formData.subscription_end_date, formData.payment, formData.remainingAmount]);

  const validateField = (name: string, value: string) => {
    let error = '';
    
    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Name is required';
        else if (!/^[a-zA-Z ]+$/.test(value)) error = 'Name should contain only letters';
        break;
      case 'contact':
        if (!value) error = 'Contact number is required';
        else if (!/^\d+$/.test(value)) error = 'Contact should contain only numbers';
        else if (value.length < 10 || value.length > 15) error = 'Contact should be 10-15 digits';
        break;
      case 'subscription':
        if (!value) error = 'Subscription is required';
        else if (!/^\d+ days?$/i.test(value)) error = 'Subscription should be in format "X days"';
        break;
      case 'subscription_start_date':
        if (!value) error = 'Start date is required';
        break;
      case 'subscription_end_date':
        if (!value) error = 'End date is required';
        break;
      case 'meals':
        if (value && !/^\d+$/.test(value)) error = 'Meals should be a number';
        break;
      case 'remainingAmount':
        if (formData.payment === 'Pending' && !value) {
          error = 'Remaining amount is required';
        } else if (value && !/^\d+$/.test(value)) {
          error = 'Amount should be a number';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Validate the field as user types
    const error = validateField(name, value);
    
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
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

  const validateForm = () => {
    let isValid = true;
    const newErrors = {...errors};
    
    // Validate all fields
    Object.keys(formData).forEach(key => {
      if (key !== 'address' && key !== 'meals_timeing') {
        const error = validateField(key, formData[key as keyof typeof formData]);
        newErrors[key as keyof typeof newErrors] = error;
        if (error) isValid = false;
      }
    });
    
    // Additional date validation
    if (formData.subscription_start_date && formData.subscription_end_date) {
      const startDate = new Date(formData.subscription_start_date);
      const endDate = new Date(formData.subscription_end_date);
      const todayDate = new Date(today);
      
      if (endDate < startDate) {
        newErrors.subscription_end_date = 'End date cannot be before start date';
        isValid = false;
      }
    }

    // Validate remaining amount for pending payments
    if (formData.payment === 'Pending' && !formData.remainingAmount) {
      newErrors.remainingAmount = 'Remaining amount is required for pending payments';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('http://3.83.158.77:3001/api/admin/AddCoustomer', {
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
              <div>
                <Input
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-gray-200 p-4 h-14 text-black"
                  required
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <Input
                  name="email"
                  placeholder="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-gray-200 p-4 h-14 text-black"
                  required
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <Input
                  name="contact"
                  placeholder="Contact Number"
                  value={formData.contact}
                  onChange={handleChange}
                  className="bg-gray-200 p-4 h-14 text-black"
                  required
                />
                {errors.contact && <p className="text-red-500 text-sm mt-1">{errors.contact}</p>}
              </div>

              <div>
                <Input
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                  className="bg-gray-200 p-4 h-14 text-black"
                />
              </div>

              <div>
                <Input
                  name="subscription"
                  placeholder="Subscription (e.g., 60 days)"
                  value={formData.subscription}
                  onChange={handleChange}
                  className="bg-gray-200 p-4 h-14 text-black"
                  required
                />
                {errors.subscription && <p className="text-red-500 text-sm mt-1">{errors.subscription}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subscription_start_date">Subscription Start Date</Label>
                  <Input
                    name="subscription_start_date"
                    type="date"
                    value={formData.subscription_start_date}
                    onChange={handleChange}
                    className="bg-gray-200 p-4 h-14 w-full text-black"
                    required
                  />
                  {errors.subscription_start_date && <p className="text-red-500 text-sm mt-1">{errors.subscription_start_date}</p>}
                </div>
                <div>
                  <Label htmlFor="subscription_end_date">Subscription End Date</Label>
                  <Input
                    name="subscription_end_date"
                    type="date"
                    value={formData.subscription_end_date}
                    onChange={handleChange}
                    min={formData.subscription_start_date || today}
                    className="bg-gray-200 p-4 h-14 w-full text-black"
                    required
                  />
                  {errors.subscription_end_date && <p className="text-red-500 text-sm mt-1">{errors.subscription_end_date}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    name="meals"
                    placeholder="Total Meals"
                    value={formData.meals}
                    onChange={handleChange}
                    className="bg-gray-200 p-4 h-14 w-full text-black"
                  />
                  {errors.meals && <p className="text-red-500 text-sm mt-1">{errors.meals}</p>}
                </div>
                <div>
                  <Input
                    name="meals_timeing"
                    placeholder="Meal Timing (e.g., lunch, dinner)"
                    value={formData.meals_timeing}
                    onChange={handleChange}
                    className="bg-gray-200 p-4 h-14 w-full text-black"
                  />
                </div>
              </div>

              <div>
                <Label>Payment Status</Label>
                <Select 
                  value={formData.payment} 
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger className="bg-gray-200 p-4 h-14 w-full text-black">
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Done">Done</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.payment === 'Pending' && (
                <div>
                  <Label htmlFor="remainingAmount">Remaining Amount</Label>
                  <Input
                    name="remainingAmount"
                    placeholder="Enter remaining amount"
                    value={formData.remainingAmount}
                    onChange={handleChange}
                    className="bg-gray-200 p-4 h-14 w-full text-black"
                  />
                  {errors.remainingAmount && <p className="text-red-500 text-sm mt-1">{errors.remainingAmount}</p>}
                </div>
              )}
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