import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../../api/admin/admincheck/admincheck";

const PublicRoute = () => {
  const { data: user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return user ? <Navigate to="/admin-dashboard" replace /> : <Outlet />;
};

export default PublicRoute;
