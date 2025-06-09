import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Calendar, Search, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format, subDays, addDays, startOfWeek, endOfWeek, isToday } from 'date-fns';

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  contact: string;
  total_salary: number;
  roles: string[];
  created_at: string;
  updated_at: string;
  __v: number;
}

const ViewAttendance = () => {
  const [staffWithoutAttendance, setStaffWithoutAttendance] = useState<StaffMember[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchStaffWithoutAttendance = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://3.83.158.77:3001/api/admin/getUsersWithoutAttendanceToday`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch staff data');
        }

        const data = await response.json();
        setStaffWithoutAttendance(data.data);
        setFilteredStaff(data.data);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaffWithoutAttendance();
  }, [currentDate]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStaff(staffWithoutAttendance);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = staffWithoutAttendance.filter(staff =>
        staff.name.toLowerCase().includes(lowercasedSearch) ||
        staff.email.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredStaff(filtered);
    }
  }, [searchTerm, staffWithoutAttendance]);

  const handleDateChange = (days: number) => {
    setCurrentDate(prev => {
      const newDate = days > 0 ? addDays(prev, days) : subDays(prev, Math.abs(days));
      return newDate;
    });
  };

  const handleWeekNavigation = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      return direction === 'prev' ? subDays(prev, 7) : addDays(prev, 7);
    });
  };

  const handleAttendanceChange = async (userId: string, status: string) => {
    try {
      const today = format(currentDate, 'yyyy-MM-dd');

      const response = await fetch('http://3.83.158.77:3001/api/admin/AddAttendance', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          date: today,
          status: status
        })
      });

      if (!response.ok) {
        throw new Error('Failed to mark attendance');
      }

      toast.success(`Attendance marked successfully`);
      
      // Refresh the list after marking attendance
      const refreshResponse = await fetch(`http://3.83.158.77:3001/api/admin/getUsersWithoutAttendanceToday`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const refreshData = await refreshResponse.json();
      setStaffWithoutAttendance(refreshData.data);
      setFilteredStaff(refreshData.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to mark attendance');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center px-4 py-6">
          <div className="text-lg">Loading staff data...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {/* Date Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleWeekNavigation('prev')}
              className="p-2"
            >
              <ChevronLeft size={18} />
            </Button>
            
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-medium">
                {format(currentDate, 'MMMM d, yyyy')}
                {isToday(currentDate) && <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Today</span>}
              </h2>
              <p className="text-sm text-gray-500">{format(currentDate, 'EEEE')}</p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleWeekNavigation('next')}
              className="p-2"
            >
              <ChevronRight size={18} />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
              className="text-xs sm:text-sm"
            >
              Today
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search by name or email..."
              className="pl-10 w-full text-sm sm:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Staff List */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {filteredStaff.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              All staff members have marked attendance for today.
            </div>
          ) : (
            <div className="divide-y">
              {filteredStaff.map(staff => (
                <div key={staff._id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm sm:text-base">{staff.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-500">{staff.email}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{staff.contact}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Select
                        onValueChange={(value) => handleAttendanceChange(staff._id, value)}
                      >
                        <SelectTrigger className="w-[140px] sm:w-[160px] text-xs sm:text-sm">
                          <SelectValue placeholder="Mark attendance" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present" className="text-xs sm:text-sm">Present</SelectItem>
                          <SelectItem value="absent" className="text-xs sm:text-sm">Absent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ViewAttendance;