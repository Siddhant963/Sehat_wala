import { useState } from 'react';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const CreateStaff = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    contact: '',
    total_salary: '',
    roles: ['staff'] // Default role is staff
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    contact: '',
    total_salary: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validateField = (name: string, value: string) => {
    let error = '';
    
    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Name is required';
        else if (!/^[a-zA-Z ]+$/.test(value)) error = 'Name should contain only letters';
        break;
      case 'email':
        if (!value) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
        break;
      case 'password':
        if (!value) error = 'Password is required';
        else if (value.length < 6) error = 'Password must be at least 6 characters';
        break;
      case 'contact':
        if (!value) error = 'Contact number is required';
        else if (!/^\d+$/.test(value)) error = 'Contact should contain only numbers';
        else if (value.length < 10 || value.length > 15) error = 'Contact should be 10-15 digits';
        break;
      case 'total_salary':
        if (!value) error = 'Salary is required';
        else if (!/^\d+$/.test(value)) error = 'Salary should be a number';
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

  const validateForm = () => {
    let isValid = true;
    const newErrors = {...errors};
    
    // Validate all fields
    Object.keys(formData).forEach(key => {
      if (key !== 'roles') {
        const error = validateField(key, formData[key as keyof typeof formData]);
        newErrors[key as keyof typeof newErrors] = error;
        if (error) isValid = false;
      }
    });
    
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
      
      const response = await fetch('http://3.83.158.77:3001/api/admin/AddStaff', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          total_salary: Number(formData.total_salary)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create staff member');
      }

      toast.success('Staff member created successfully');
      navigate('/staff');
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
          <Link to="/staff" className="flex items-center text-neutral-dark">
            <ArrowLeft size={20} className="mr-2" />
            <span>Back to Staff</span>
          </Link>
        </div>
        
        <div className="card">
          <div className="bg-neutral-dark text-white p-4 mb-6">
            <h1 className="text-xl font-medium text-center">Create Staff Member</h1>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  placeholder="Password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-gray-200 p-4 h-14 text-black"
                  required
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
              
              <div>
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
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
                <Label htmlFor="total_salary">Salary</Label>
                <Input
                  id="total_salary"
                  name="total_salary"
                  placeholder="Salary"
                  value={formData.total_salary}
                  onChange={handleChange}
                  className="bg-gray-200 p-4 h-14 text-black"
                  required
                />
                {errors.total_salary && <p className="text-red-500 text-sm mt-1">{errors.total_salary}</p>}
              </div>
              
              <div>
                <Label>Role</Label>
                <div className="bg-gray-200 w-full text-black  p-4 h-14 rounded-md flex items-center">
                  Staff (default)
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-teal-600 text-white p-4 rounded-full text-xl font-medium disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Staff Member'}
            </button>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CreateStaff;