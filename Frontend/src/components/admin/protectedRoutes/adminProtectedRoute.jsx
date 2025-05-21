import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../../api/admin/admincheck/admincheck";

const ProtectedadminRoute = () => {
  const { data: user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return user ? <Outlet /> : <Navigate to="/adminlogin" replace />;
};

export default ProtectedadminRoute;
