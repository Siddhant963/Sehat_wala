import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  contact: string;
  total_salary: number;
  roles: string[];
}

const EditStaff = () => {
  const [formData, setFormData] = useState<StaffMember>({
    _id: '',
    name: '',
    email: '',
    contact: '',
    total_salary: 0,
    roles: ['staff']
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStaffDetails = async () => {
      try {
        const response = await fetch(
          `http://3.83.158.77:3001/api/admin/getallusersbyfillter?_id=${id}`,

          { 
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch staff details');
        }

        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setFormData(data.data[0]);
        } else {
          throw new Error('Staff member not found');
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'An error occurred');
        navigate('/staff');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaffDetails();
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.contact || !formData.total_salary) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Convert data to x-www-form-urlencoded format
      const formBody = new URLSearchParams();
      formBody.append('_id', formData._id);
      formBody.append('name', formData.name);
      formBody.append('email', formData.email);
      formBody.append('contact', formData.contact);
      formBody.append('total_salary', formData.total_salary.toString());
      formData.roles.forEach(role => {
        formBody.append('roles', role);
      });

      const response = await fetch('http://3.83.158.77:3001/api/admin/updateUser', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formBody.toString()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update staff member');
      }

      toast.success('Staff member updated successfully');
      navigate('/staff');
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
          <div className="text-lg">Loading staff details...</div>
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
          <Link to="/staff" className="flex items-center text-neutral-dark">
            <ArrowLeft size={20} className="mr-2" />
            <span>Back to Staff</span>
          </Link>
        </div>
        
        <div className="card">
          <div className="bg-neutral-dark text-white p-4 mb-6">
            <h1 className="text-xl font-medium text-center">Edit Staff Member</h1>
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
                  className="bg-gray-400 p-4 h-14"
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
                  className="bg-gray-400 p-4 h-14"
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
                  className="bg-gray-400 p-4 h-14"
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
                  className="bg-gray-400 p-4 h-14"
                  required
                />
              </div>
              
              <div>
                <Label>Role</Label>
                <div className="bg-gray-400 w-full p-4 h-14 rounded-md flex items-center">
                  {formData.roles.join(', ')}
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-teal-600 text-white p-4 rounded-full text-xl font-medium disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Staff Member'}
            </button>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EditStaff;