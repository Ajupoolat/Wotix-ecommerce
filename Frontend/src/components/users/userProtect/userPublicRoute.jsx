import { Outlet, Navigate } from "react-router-dom";
import { userauth } from "@/api/users/usercheck/userauth";

const PublicUserRoute = () => {
  const { data: user, isLoading, isError } = userauth();

  if (isLoading) {
    return null;
  }

  if (isError) {
    return <Outlet />;
  }

  return user ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicUserRoute;
