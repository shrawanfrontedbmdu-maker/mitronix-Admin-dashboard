import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import "./index.css";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./components/Dashboard";
import ProductList from "./pages/ProductList";
import ProductGrid from "./pages/ProductGrid";
import ProductDetails from "./pages/ProductDetails";
import ProductEdit from "./pages/ProductEdit";
import CreateProduct from "./pages/CreateProduct";
import CategoriesList from "./pages/CategoriesList";
import CreateCategory from "./pages/CreateCategory";
import EditCategory from "./pages/EditCategory";
import OrdersList from "./pages/OrdersList";
import OrderDetails from "./pages/OrderDetails";
import OrderAdd from "./pages/OrderAdd";
import OrderEdit from "./pages/OrderEdit";
import InvoicesList from "./pages/InvoicesList";
import InvoiceDetails from "./pages/InvoiceDetails";
import InvoiceAdd from "./pages/InvoiceAdd";
import InvoiceEdit from "./pages/InvoiceEdit";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import ServiceRequestList from "./pages/ServiceRequestList";
import ServiceRequestDetails from "./pages/ServiceRequestDetails";
import ServiceRequestEdit from "./pages/ServiceRequestEdit";
import BlogList from "./pages/BlogList";
import BlogDetails from "./pages/BlogDetails";
import BlogEdit from "./pages/BlogEdit";
import CreateBlog from "./pages/CreateBlog";
import CreateServiceRequest from "./pages/CreateServiceRequest";
import BannerList from "./pages/BannerList";
import BannerDetails from "./pages/BannerDetails";
import CreateBanner from "./pages/CreateBanner";
import RoleList from "./pages/RoleList";
import RoleDetails from "./pages/RoleDetails";
import CreateRole from "./pages/CreateRole";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BannerEdit from "./pages/BannerEdit";
import RoleEdit from "./pages/EditRoles";
import BrandsList from "./pages/BrandsList";
import CreateBrand from "./pages/CreateBrand";
import EditBrand from "./pages/EditBrand";
import InventoryList from "./pages/InventoryList";
import InfoSectionsList from "./pages/infosectionList";
import CreateInfoSection from "./pages/CreateinfoSection";
import EditInfoSection from "./pages/EditinfoSection";
import ForgetPassword from "./pages/ForgetPassword";
import Editprofile from "./pages/Editprofile";
import CouponsList from "./pages/CouponsList";
import CouponsAdd from "./pages/CouponsAdd";
import CopunsAnalytics from "./pages/CopunsAnalytics";
import Couponsedit from "./pages/Couponsedit";
import CustomerList from "./pages/CustomerList";
import CustomerRefferal from "./pages/CustomerRefferal";
import UserProfile from "./pages/UserProfile";
import { useState } from "react";
import { useEffect } from "react";
import Store from "./pages/stores/Store";
import AddStore from "./pages/stores/AddStore";
import DelayBanners from "./pages/DelayBanners"
import DelayBannerCreate from "./pages/DelayBannerCreate";
import DelayBannerupdate from "./pages/DelayBannerupdate";
function Admin() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    const adminData = localStorage.getItem("adminData");

    if (adminToken && adminData) {
      try {
        const parsedAdminData = JSON.parse(adminData);
        localStorage.setItem(
          "adminData",
          JSON.stringify({ ...parsedAdminData, name: parsedAdminData.name }),
        );
      } catch (error) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminData");
      }
    }

    setIsLoading(false);
  }, []);

  const clearAuth = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/admin");
  };

  const isAuthenticated = !!(
    localStorage.getItem("adminToken") && localStorage.getItem("adminData")
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="app">
      {isAuthenticated && <Sidebar onLogout={handleLogout} />}
      <div className={`main-content ${isAuthenticated ? '' : 'auth-page'}`}>
        <Routes>
          {/* Auth Routes */}
          <Route index element={isAuthenticated ? <Dashboard /> : <Login role={"admin"} />} />

          {isAuthenticated ? (
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="dashboard" element={<Dashboard />} />

              {/* Products Routes */}
              <Route path="products/list" element={<ProductList />} />
              <Route path="products/grid" element={<ProductGrid />} />
              <Route path="products/details/:id" element={<ProductDetails />} />
              <Route path="products/edit/:id" element={<ProductEdit />} />
              <Route path="products/edit" element={<ProductEdit />} />
              <Route path="products/create" element={<CreateProduct />} />

              {/*infoCard*/}
              <Route path="infosection/list" element={<InfoSectionsList />} />
              <Route
                path="infosections/create"
                element={<CreateInfoSection />}
              />
              <Route
                path="infosections/edit/:id"
                element={<EditInfoSection />}
              />
              <Route path="infosections/edit" element={<EditInfoSection />} />

              {/* Categories Routes */}
              <Route path="categories/list" element={<CategoriesList />} />
              <Route path="categories/create" element={<CreateCategory />} />
              <Route path="categories/edit/:id" element={<EditCategory />} />
              <Route path="categories/edit" element={<EditCategory />} />

              {/* Brands Routes */}
              <Route path="brands/list" element={<BrandsList />} />
              <Route path="brands/create" element={<CreateBrand />} />
              <Route path="brands/edit/:id" element={<EditBrand />} />
              <Route path="brands/edit" element={<EditBrand />} />

              {/* Inventory / Stock Control */}
              <Route path="inventory" element={<InventoryList />} />

              {/* Orders Routes */}
              <Route path="orders/list" element={<OrdersList />} />
              <Route path="orders/details/:id" element={<OrderDetails />} />
              <Route path="orders/details" element={<OrderDetails />} />
              <Route path="orders/add" element={<OrderAdd />} />
              <Route path="orders/edit/:id" element={<OrderEdit />} />
              <Route path="orders" element={<OrdersList />} />

              {/* Invoices Routes */}
              <Route path="invoices/list" element={<InvoicesList />} />
              <Route path="invoices/details/:id" element={<InvoiceDetails />} />
              <Route path="invoices/details" element={<InvoiceDetails />} />
              <Route path="invoices/add" element={<InvoiceAdd />} />
              <Route path="invoices/add/:id" element={<InvoiceAdd />} />
              <Route path="invoices/edit/:id" element={<InvoiceEdit />} />
              <Route path="invoices" element={<InvoicesList />} />

              {/* Settings & Profile & Notifications */}
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
              <Route path="profle/edit" element={<Editprofile />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="service-request" element={<ServiceRequestList />} />

              {/*Coupons Routes  */}
              <Route path="coupons/list" element={<CouponsList />} />
              <Route path="coupons/create" element={<CouponsAdd />} />
              <Route path="coupons/analystics" element={<CopunsAnalytics />} />
              <Route path="coupons/update" element={<Couponsedit />} />
              <Route path="coupons/update/:id" element={<Couponsedit />} />

              {/*Customer Route */}
              <Route path="customer/list" element={<CustomerList />} />
              <Route path="customer/refferal" element={<CustomerRefferal />} />
              <Route path="customer/profile" element={<UserProfile />} />
              <Route path="customer/profile/:id" element={<UserProfile />} />
              {/* Service Requests Routes */}
              <Route path="service-requests" element={<ServiceRequestList />} />
              <Route
                path="service-requests/create"
                element={<CreateServiceRequest />}
              />
              <Route
                path="service-requests/:id"
                element={<ServiceRequestDetails />}
              />
              <Route
                path="service-requests/:id/edit"
                element={<ServiceRequestEdit />}
              />

              {/* Blog Routes */}
              <Route path="blogs" element={<BlogList />} />
              <Route path="blogs/create" element={<CreateBlog />} />
              <Route path="blogs/:id" element={<BlogDetails />} />
              <Route path="blogs/:id/edit" element={<BlogEdit />} />

              {/* Banner Routes */}
              <Route path="banners" element={<BannerList />} />
              <Route path="banners/create" element={<CreateBanner />} />
              <Route path="banners/:id" element={<BannerDetails />} />
              <Route path="banners/:id/edit" element={<BannerEdit />} />

              {/*Delay Banners */}
              <Route path="delay-banners" element={<DelayBanners />} />
              <Route path="delay-banners/create" element={<DelayBannerCreate />} />
              <Route path="delay-banners/update/:id" element={<DelayBannerupdate />} />
              {/* Role Routes */}
              <Route path="roles" element={<RoleList />} />
              <Route path="roles/create" element={<CreateRole />} />
              <Route path="roles/:id" element={<RoleDetails />} />
              <Route path="roles/edit/:id" element={<RoleEdit />} />

              {/* Placeholder routes for other nav items */}

              <Route
                path="permissions"
                element={
                  <div className="page-header">
                    <h1>Permissions Page</h1>
                  </div>
                }
              />
              <Route
                path="customers"
                element={
                  <div className="page-header">
                    <h1>Customers Page</h1>
                  </div>
                }
              />
              <Route
                path="stores/list"
                element={
                  <Store />
                }
              />
              <Route
                path="stores/create"
                element={
                  <AddStore />
                }
              />
            </Route>
          ) : (
            <Route path="*" element={<Login role={"admin"} />} />
          )}
        </Routes>
      </div>
    </div>
  );
}

// function App() {
//   return (
//     <Router>
//       <AppContent />
//     </Router>
//   );
// }

export default Admin;
