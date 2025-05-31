import { Navigate, Outlet } from "react-router-dom";
import { userauth } from "@/api/users/usercheck/userauth";
import LoaderSpinner from "@/components/common/spinner";

const ProtecteduserRoute = () => {
  const { data: user, isLoading, isError } = userauth();

  if (isLoading) {
    return <div>
      <LoaderSpinner/>
    </div>; 
  }



  if (isError) {
    return <Navigate to="/login" replace />;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtecteduserRoute;
