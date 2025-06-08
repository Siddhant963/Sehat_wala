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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.contact || !formData.total_salary) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isNaN(Number(formData.total_salary))) {
      toast.error('Salary must be a number');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await fetch('http://localhost:3001/api/admin/AddStaff', {
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