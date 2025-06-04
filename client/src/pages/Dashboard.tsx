import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import StatCard from '@/components/ui/StatCard';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';



const Dashboard = () => {
  const  [desdata , setDesdata] = useState({
    totalCoustomers: 0,
    totaldayDeleveries: 0,
    totalAttendance: 0,
    penddingDeliveries: 0,
  });
  useEffect(() => {
    const fetchdeshbordDetails = async () => {
      const url = "http://localhost:3001/api/admin/deshbordDetails"
      const data = await fetch(url)
      const jsonData = await data.json()
      // console.log(jsonData.data)
      setDesdata(jsonData .data)
    }
    fetchdeshbordDetails()
   
 
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-6 animate-fade-in">
        {/* Stats Grid - Responsive columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Total Active customers" 
            value={desdata.totalCoustomers}  
            className="h-full"
          />
          
          <StatCard 
            title="Total deliveries of the day" 
            value={desdata.totaldayDeleveries} 
            className="h-full"
          />
          
          <StatCard 
            title="Today's Attendance" 
            value={desdata.totalAttendance}
            className="h-full"
          />
          
          <StatCard 
            title="Pending Orders" 
            value={desdata.penddingDeliveries} 
            className="h-full"
          />
        </div>

        {/* Navigation Cards - Responsive sizing */}
        <div className="space-y-4">
          <Link 
            to="/customers"
            className="card flex items-center justify-between p-4 sm:p-6 hover:opacity-90 transition-opacity bg-gray rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="text-lg sm:text-xl font-medium">Customer Management</span>
            <ChevronRight size={20} className="ml-2" />
          </Link>
          
          <Link 
            to="/staff"
            className="card flex items-center justify-between p-4 sm:p-6 hover:opacity-90 transition-opacity bg-gray rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="text-lg sm:text-xl font-medium">Staff Management</span>
            <ChevronRight size={20} className="ml-2" />
          </Link>
          
          <Link 
            to="/orders"
            className="card flex items-center justify-between p-4 sm:p-6 hover:opacity-90 transition-opacity bg-gray rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="text-lg sm:text-xl font-medium">Order Management</span>
            <ChevronRight size={20} className="ml-2" />
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;