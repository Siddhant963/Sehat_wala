import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CustomerCard from '@/components/ui/CustomerCard';
import { UserPlus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Customer {
  _id: string;
  name: string;
  email: string;
  contact: string;
  address: string;
  subscription_start_date: string;
  subscription_end_date: string;
  meals: number;
  status?: 'Active' | 'Inactive';
}

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('http://3.83.158.77:3001/api/admin/getallcoustomers', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }

        const data = await response.json();
        
        const transformedCustomers = data.data.map((customer: Customer) => ({
          ...customer,
          status: new Date(customer.subscription_end_date) > new Date() ? 'Active' : 'Inactive'
        }));

        setCustomers(transformedCustomers);
        setFilteredCustomers(transformedCustomers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        toast.error('Failed to load customers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    // Filter customers whenever searchTerm changes
    if (searchTerm.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = customers.filter(customer => 
        customer.name.toLowerCase().includes(lowercasedSearch) ||
        customer.email.toLowerCase().includes(lowercasedSearch) ||
        customer.address.toLowerCase().includes(lowercasedSearch) ||
        customer.contact.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);

  const handleAddCustomer = () => {
    navigate('/customers/create');
  };

  const handleEditCustomer = (id: string) => {
    navigate(`/customers/edit/${id}`);
  };

  const handleRemoveCustomer = async (id: string) => {
    const url = `http://3.83.158.77:3001/api/admin/removeCoustomer?coustomer_id=${id}`
    const token = localStorage.getItem('token')
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
    const response = await fetch(url, {
      method: 'get',
      headers: headers
    })
    const data = await response.json()
    console.log(data)
    if(data){
      toast.success('Customer removed successfully')
      window.location.reload();
    }else{
      toast.error('Failed to remove customer')
    }
  }


  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-6 flex items-center justify-center">
          <div className="text-lg">Loading customers...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-6 flex items-center justify-center">
          <div className="text-red-500">{error}</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-6 animate-fade-in">
        {/* Header and Search Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="w-full sm:flex-1 sm:max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search customers..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>
          
          <button 
            onClick={handleAddCustomer}
            className="w-full sm:w-auto bg-teal-700 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-lg shadow-md hover:bg-teal-600 transition-all duration-300 flex items-center justify-center"
          >
            <span className="mr-2 text-sm sm:text-base">Add customer</span>
            <UserPlus size={18} />
          </button>
        </div>
        
        {/* Customer Cards Grid */}
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No customers found matching your search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map(customer => (
              <CustomerCard 
                key={customer._id}
                name={customer.name}
                location={customer.address}
                joinDate={new Date(customer.subscription_start_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
                mealsLeft={customer.meals}
                status={customer.status}
                onEdit={() => handleEditCustomer(customer._id)}
                onRemove={() => handleRemoveCustomer(customer._id)} 
              />
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Customers;