import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState(localStorage.getItem('savedEmail') || 'aman@gmail.com');
  const [password, setPassword] = useState('123456');
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem('savedEmail'));
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    setIsLoggingIn(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
       
        
      // Store the token and user data
     
      localStorage.setItem('email', data.email);
      localStorage.setItem('role', data.role[0]);
     

     
      
      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem('savedEmail', email);
      } else {
        localStorage.removeItem('savedEmail');
      }
      
      toast.success('Login successful');
      
      // Redirect based on role
      if (data.role[0] === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/delivery');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDeliveryMode = () => {
    navigate('/delivery');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-light px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <div className="w-8 h-8 rounded-full border-2 border-red-400 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-red-300"></div>
            </div>
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-neutral-dark uppercase">
            The Sehat Wala
          </h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="email"
              placeholder="EMAIL"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="PASSWORD"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          


          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
              Remember my email
            </label>
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoggingIn}
              className="btn-primary w-full transition-all"
            >
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </button>
          </div>
          
          {/* <div className="pt-2">
            <button
              type="button"
              onClick={handleDeliveryMode}
              className="btn-secondary w-full"
            >
              Delivery
            </button>
          </div> */}
        </form>
      </div>
    </div>
  );
};

export default Login;