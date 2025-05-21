import { Navigate, Outlet } from "react-router-dom";
import { userauth } from "@/api/users/usercheck/userauth";

const ProtecteduserRoute = () => {
  const { data: user, isLoading, isError } = userauth();

  if (isLoading) {
    return <div>Loading authentication...</div>; 
  }

  if (isError) {
    return <Navigate to="/login" replace />;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtecteduserRoute;
