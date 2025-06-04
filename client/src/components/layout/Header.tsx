
import { useState } from 'react';
import { Menu, User, LogOut, UserCircle, Edit } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    toast.success('Logged out successfully');
    // In a real app, this would handle authentication
    window.location.href = '/';
  };

  const handleEditProfile = () => {
    toast.info('Profile editing functionality will be implemented soon');
    // This would navigate to a profile edit page in a complete implementation
  };

  return (
    <header className="bg-neutral-dark text-white p-4 sticky top-0 z-50 shadow-md">
      <div className="flex justify-between items-center">
        <button
          className="p-2 rounded-full hover:bg-neutral-700 transition-colors"
          onClick={toggleMenu}
          aria-label="Menu"
        >
          <Menu size={24} />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
            <User className="text-neutral-dark" size={20} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleEditProfile}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Change Username/Password</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile menu - simplified to only show Customer and Order Management */}
      {menuOpen && (
        <div className="absolute top-16 left-0 w-64 bg-white text-neutral-dark rounded-r-lg shadow-xl scale-in z-50">
          <nav className="py-4">
            <ul className="space-y-1">
              <li>
                <Link 
                  to="/dashboard" 
                  className={`block px-6 py-3 hover:bg-gray-100 transition-colors ${location.pathname === '/dashboard' ? 'font-medium text-teal-700' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/customers" 
                  className={`block px-6 py-3 hover:bg-gray-100 transition-colors ${location.pathname === '/customers' ? 'font-medium text-teal-700' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Customer Management
                </Link>
              </li>
              <li>
                <Link 
                  to="/orders" 
                  className={`block px-6 py-3 hover:bg-gray-100 transition-colors ${location.pathname === '/orders' ? 'font-medium text-teal-700' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Order Management
                </Link>
              </li>
              <li>
                <Link 
                  to="/staff" 
                  className={`block px-6 py-3 hover:bg-gray-100 transition-colors ${location.pathname === '/inventory' ? 'font-medium text-teal-700' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Staff Management
                </Link>
              </li>
              <li className="border-t mt-2 pt-2">
                <button 
                  className="flex items-center w-full px-6 py-3 text-red-500 hover:bg-gray-100 transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut size={18} className="mr-2" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
