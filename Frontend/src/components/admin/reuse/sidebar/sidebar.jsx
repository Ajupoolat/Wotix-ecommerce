import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { adminLogout } from "@/api/admin/Login/loginAuth";

const AdminSidebar = ({ activeRoute = "" }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: logoutMutate, isPending: isLoggingOut } = useMutation({
    mutationFn: adminLogout,
    onSuccess: () => {
      toast.success("Logged out successfully!");
      queryClient.removeQueries(["auth"]);
      navigate("/adminlogin");
    },
    onError: (err) => {
      toast.error(err.message || "Logout failed");
    },
  });

  const handleLogout = () => {
    logoutMutate();
  };

  const navItems = [
    { path: "/admin-dashboard", label: "Dashboard" },
    { path: "/admin/users", label: "Users" },
    { path: "/admin/productlist", label: "Products" },
    { path: "/admin/orders", label: "Orders" },
    { path: "/admin/offers", label: "Offers" },
    { path: "/admin/categories", label: "Categories" },
    { path: "/admin/coupon", label: "Coupon" },
  ];

  return (
    <aside className="w-64 bg-white border-r">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-800">WOTIX</h1>
      </div>
      <nav className="mt-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => navigate(item.path)}
                className={`w-full text-left px-4 py-2 ${
                  activeRoute === item.path
                    ? "bg-black text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-200 flex items-center"
              disabled={isLoggingOut}
            >
              <ArrowLeftStartOnRectangleIcon className="w-5 h-5 mr-2" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;