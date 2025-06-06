import { Navigate , useLocation } from "react-router-dom";

const ProtectedRoute = ({ children , allowedRoles }: { children: JSX.Element , allowedRoles: string[] }) => {
  const location = useLocation();
  const role = localStorage.getItem("role");

  // Check if the user is authenticated
  if (!role) {
    return <Navigate to="/" replace />;
  }
if(!allowedRoles.includes(role)){
          //not allowed redirect based on role 
          if (role === "staff") {
                       return <Navigate to="/delivery" replace />;
                    }
                    return <Navigate to="/dashboard" replace />;

}

  return children;
};

export default ProtectedRoute;