import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import ProductList from './pages/ProductList'
import ProductGrid from './pages/ProductGrid'
import ProductDetails from './pages/ProductDetails'
import ProductEdit from './pages/ProductEdit'
import CreateProduct from './pages/CreateProduct'
import CategoriesList from './pages/CategoriesList'
import CreateCategory from './pages/CreateCategory'
import EditCategory from './pages/EditCategory'
import OrdersList from './pages/OrdersList'
import OrderDetails from './pages/OrderDetails'
import OrderAdd from './pages/OrderAdd'
import OrderEdit from './pages/OrderEdit'
import InvoicesList from './pages/InvoicesList'
// import InvoiceDetails from './pages/InvoiceDetails'
import InvoiceAdd from './pages/InvoiceAdd'
import InvoiceEdit from './pages/InvoiceEdit'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import ServiceRequestList from './pages/ServiceRequestList'
import ServiceRequestDetails from './pages/ServiceRequestDetails'
import ServiceRequestEdit from './pages/ServiceRequestEdit'
import BlogList from './pages/BlogList'
import BlogDetails from './pages/BlogDetails'
import BlogEdit from './pages/BlogEdit'
import CreateBlog from './pages/CreateBlog'
import CreateServiceRequest from './pages/CreateServiceRequest'
import BannerList from './pages/BannerList'
import BannerDetails from './pages/BannerDetails'
import CreateBanner from './pages/CreateBanner'
import RoleList from './pages/RoleList'
import RoleDetails from './pages/RoleDetails'
import CreateRole from './pages/CreateRole'
import Login from './pages/Login'
import Signup from './pages/Signup'
import BannerEdit from './pages/BannerEdit'
import RoleEdit from './pages/EditRoles'
import BrandsList from './pages/BrandsList'
import CreateBrand from './pages/CreateBrand'
import EditBrand from './pages/EditBrand'
import InventoryList from './pages/InventoryList'
import InfoSectionsList from './pages/infosectionList'
import CreateInfoSection from './pages/CreateinfoSection'
import EditInfoSection from './pages/EditinfoSection'

function AppContent() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'

  return (
    <div className="app">
      {!isAuthPage && <Sidebar />}
      <div className={`main-content ${isAuthPage ? 'auth-page' : ''}`}>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Products Routes */}
          <Route path="/products/list" element={<ProductList />} />
          <Route path="/products/grid" element={<ProductGrid />} />
          <Route path="/products/details/:id" element={<ProductDetails />} />
          <Route path="/products/edit/:id" element={<ProductEdit />} />
          <Route path="/products/edit" element={<ProductEdit />} />
          <Route path="/products/create" element={<CreateProduct />} />


           {/*infoCard*/}
          <Route path="/infosection/list" element={<InfoSectionsList />} />
          <Route path="/infosections/create" element={<CreateInfoSection />} />
          <Route path="/infosections/edit/:id" element={<EditInfoSection />} />
          <Route path="/infosections/edit" element={<EditInfoSection />} />

          {/* Categories Routes */}
          <Route path="/categories/list" element={<CategoriesList />} />
          <Route path="/categories/create" element={<CreateCategory />} />
          <Route path="/categories/edit/:id" element={<EditCategory />} />
          <Route path="/categories/edit" element={<EditCategory />} />

          Brands Routes
          <Route path="/brands/list" element={<BrandsList />} />
          <Route path="/brands/create" element={<CreateBrand />} />
          <Route path="/brands/edit/:id" element={<EditBrand />} />
          <Route path="/brands/edit" element={<EditBrand />} />

          {/* Inventory / Stock Control */}
          <Route path="/inventory" element={<InventoryList />} />

          {/* Orders Routes */}
          <Route path="/orders/list" element={<OrdersList />} />
          <Route path="/orders/details/:id" element={<OrderDetails />} />
          <Route path="/orders/details" element={<OrderDetails />} />
          <Route path="/orders/add" element={<OrderAdd />} />
          <Route path="/orders/edit/:id" element={<OrderEdit />} />
          <Route path="/orders" element={<OrdersList />} />

          {/* Invoices Routes */}
          <Route path="/invoices/list" element={<InvoicesList />} />
          {/* <Route path="/invoices/details/:id" element={<InvoiceDetails />} /> */}
          {/* <Route path="/invoices/details" element={<InvoiceDetails />} /> */}
          <Route path="/invoices/add" element={<InvoiceAdd />} />
          <Route path='/invoices/add/:id' element={<InvoiceAdd />} />
          <Route path="/invoices/edit/:id" element={<InvoiceEdit />} />
          <Route path="/invoices" element={<InvoicesList />} />

          {/* Settings & Profile & Notifications */}
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/service-request" element={<ServiceRequestList />} />

          {/* Service Requests Routes */}
          <Route path="/service-requests" element={<ServiceRequestList />} />
          <Route path="/service-requests/create" element={<CreateServiceRequest />} />
          <Route path="/service-requests/:id" element={<ServiceRequestDetails />} />
          <Route path="/service-requests/:id/edit" element={<ServiceRequestEdit />} />

          {/* Blog Routes */}
          <Route path="/blogs" element={<BlogList />} />
          <Route path="/blogs/create" element={<CreateBlog />} />
          <Route path="/blogs/:id" element={<BlogDetails />} />
          <Route path="/blogs/:id/edit" element={<BlogEdit />} />

          {/* Banner Routes */}
          <Route path="/banners" element={<BannerList />} />
          <Route path="/banners/create" element={<CreateBanner />} />
          <Route path="/banners/:id" element={<BannerDetails />} />
          <Route path="/banners/:id/edit" element={<BannerEdit />} />

          {/* Role Routes */}
          <Route path="/roles" element={<RoleList />} />
          <Route path="/roles/create" element={<CreateRole />} />
          <Route path="/roles/:id" element={<RoleDetails />} />
          <Route path="/roles/edit" element={<RoleEdit />} />

          {/* Placeholder routes for other nav items */}

          <Route path="/permissions" element={<div className="page-header"><h1>Permissions Page</h1></div>} />
          <Route path="/customers" element={<div className="page-header"><h1>Customers Page</h1></div>} />
          <Route path="/sellers" element={<div className="page-header"><h1>Sellers Page</h1></div>} />
        </Routes>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
