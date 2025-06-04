import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { UserPlus, Search, CalendarCheck, CheckCircle2, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  contact: string;
  total_salary: number;
  roles: string[];
  created_at: string;
}

interface AttendanceRecord {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    contact: string;
  };
  date: string;
  status: 'present' | 'absent';
  created_at: string;
  updated_at: string;
  __v: number;
}

const Staff = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  const [staffWithoutAttendance, setStaffWithoutAttendance] = useState<StaffMember[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showMissingAttendance, setShowMissingAttendance] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all staff
        const staffResponse = await fetch('http://localhost:3001/api/admin/getallusers', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!staffResponse.ok) throw new Error('Failed to fetch staff data');
        const staffData = await staffResponse.json();
        setStaff(staffData.data);
        setFilteredStaff(staffData.data);

        // Fetch staff without attendance
        const missingAttendanceResponse = await fetch('http://localhost:3001/api/admin/getUsersWithoutAttendanceToday', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!missingAttendanceResponse.ok) throw new Error('Failed to fetch staff without attendance');
        const missingAttendanceData = await missingAttendanceResponse.json();
        setStaffWithoutAttendance(missingAttendanceData.data);

        // Fetch today's attendance
        const attendanceResponse = await fetch('http://localhost:3001/api/admin/getTodayAttendance', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!attendanceResponse.ok) throw new Error('Failed to fetch today\'s attendance');
        const attendanceData = await attendanceResponse.json();
        setAttendance(attendanceData.data);

        // Initialize attendance status
        const initialStatus: Record<string, string> = {};
        staffData.data.forEach((member: StaffMember) => {
          initialStatus[member._id] = '';
        });
        setAttendanceStatus(initialStatus);

      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStaff(showMissingAttendance ? staffWithoutAttendance : staff);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const sourceArray = showMissingAttendance ? staffWithoutAttendance : staff;
      const filtered = sourceArray.filter(member =>
        member.name.toLowerCase().includes(lowercasedSearch) ||
        member.email.toLowerCase().includes(lowercasedSearch) ||
        member.contact.toLowerCase().includes(lowercasedSearch) ||
        member.roles.some(role => role.toLowerCase().includes(lowercasedSearch)) ||
        member.total_salary.toString().includes(searchTerm)
      );
      setFilteredStaff(filtered);
    }
  }, [searchTerm, staff, staffWithoutAttendance, showMissingAttendance]);

  const handleAddEmployee = () => {
    window.location.href = '/staff/create';
  };

  const handleViewAttendance = () => {
    window.location.href = '/staff/MarkAttendance';
  };

  const handleAttendanceChange = async (userId: string, status: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const response = await fetch('http://localhost:3001/api/admin/AddAttendance', {
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

      if (!response.ok) throw new Error('Failed to update attendance');

      toast.success(`Attendance marked as ${status}`);
      
      // Refresh data
      const [missingRes, todayRes] = await Promise.all([
        fetch('http://localhost:3001/api/admin/getUsersWithoutAttendanceToday', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:3001/api/admin/getTodayAttendance', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      const [missingData, todayData] = await Promise.all([
        missingRes.json(),
        todayRes.json()
      ]);

      setStaffWithoutAttendance(missingData.data);
      setAttendance(todayData.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update attendance');
    }
  };

  const handleEditEmployee = (userId: string) => {
    window.location.href = `/staff/edit/${userId}`;
  };

  const handleRemoveEmployee = async (userId: string) => {
    const url = `http://localhost:3001/api/admin/removeUser?user_id=${userId}`;
    const data = await fetch(url)
    const jsonData = await data.json()
    console.log(jsonData)

    if(jsonData){
      toast.success('Employee removed successfully')
      window.location.reload()
    } else {
      toast.error('Failed to remove employee')
    }
  }

  const toggleMissingAttendanceView = () => {
    setShowMissingAttendance(!showMissingAttendance);
    setSearchTerm('');
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
        {/* Top Controls Section */}
        <div className="flex flex-col gap-3 mb-4 sm:mb-6">
          {/* Search Input */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search staff..."
              className="pl-10 w-full text-sm sm:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Button Group */}
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
              onClick={toggleMissingAttendanceView}
              variant={showMissingAttendance ? "default" : "outline"}
              className="flex items-center justify-center gap-2 py-2 text-xs sm:text-sm"
              size="sm"
            >
              <CalendarCheck size={16} />
              <span>{showMissingAttendance ? "All Staff" : "Missing Attendance"}</span>
            </Button>
            
            <Button
              onClick={handleViewAttendance}
              variant="outline"
              className="flex items-center justify-center gap-2 py-2 text-xs sm:text-sm"
              size="sm"
            >
              <CalendarCheck size={16} />
              <span>Mark Attendance</span>
            </Button>

            <Button
              onClick={handleAddEmployee}
              className="flex items-center justify-center gap-2 py-2 text-xs sm:text-sm"
              size="sm"
            >
              <UserPlus size={16} />
              <span>Add Employee</span>
            </Button>
          </div>
        </div>

        {showMissingAttendance && (
          <div className="mb-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded text-sm sm:text-base">
            <p className="text-yellow-700">
              Showing {staffWithoutAttendance.length} staff members who haven't marked attendance today.
            </p>
          </div>
        )}

        {/* Staff Members Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-medium mb-3">Staff Members</h2>

          {filteredStaff.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm sm:text-base">
              No staff members found matching your search criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredStaff.map(member => (
                <div key={member._id} className="flex flex-col justify-between p-3 sm:p-4 border rounded-lg shadow-sm bg-gray-400 text-white">
                  <div className="mb-3">
                    <h3 className="font-medium text-sm sm:text-base">{member.name}</h3>
                    <p className="text-xs sm:text-sm text-white opacity-90">{member.roles.join(', ')}</p>
                    <p className="text-xs sm:text-sm mt-1">Salary: ₹{member.total_salary}</p>
                    <p className="text-xs sm:text-sm">Contact: {member.contact}</p>
                    <p className="text-xs sm:text-sm truncate">Email: {member.email}</p>
                    <p className="text-xs sm:text-sm">Joined: {new Date(member.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleEditEmployee(member._id)}
                      className="w-full px-2 py-1 text-xs sm:text-sm bg-teal-600 text-white rounded hover:bg-blue-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemoveEmployee(member._id)}
                      className="w-full px-2 py-1 text-xs sm:text-sm bg-teal-600 text-white rounded hover:bg-red-600 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attendance Tracker Section - Updated */}
        <div>
          <h2 className="text-lg sm:text-xl font-medium mb-3">Today's Attendance</h2>

          {attendance.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm sm:text-base">
              No attendance records found for today.
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="divide-y">
                {attendance.map(record => (
                  <div key={record._id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm sm:text-base">{record.user_id.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-500">Contact: {record.user_id.contact}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Marked at: {new Date(record.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {record.status === 'present' ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle2 className="mr-1" size={18} />
                            <span className="capitalize text-sm sm:text-base">Present</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <XCircle className="mr-1" size={18} />
                            <span className="capitalize text-sm sm:text-base">Absent</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Staff;