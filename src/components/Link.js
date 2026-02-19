import {
  MdDashboard,
  MdShoppingBag,
  MdCategory,
  MdShoppingCart,
  MdReceipt,
  MdSettings,
  MdPerson,
  MdGroup,
  MdNotificationAdd,
  MdReceiptLong,
  MdMiscellaneousServices,
  MdArticle,
  MdViewCarousel,
  MdAdminPanelSettings,
  MdCardGiftcard,
  MdLightbulb,
  MdFilterAlt,
  MdPayments
} from "react-icons/md";

const sidebarLinks = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: MdDashboard,
    roles: ["admin", "storeManager"],
  },
  {
    label: "Filter",
    path: "/filters",
    icon: MdFilterAlt,
    roles: ["admin"],
  },
  {
    label: "Products",
    path: "/products/list",
    icon: MdShoppingBag,
    match: "/products",
    roles: ["admin"],
  },
  {
    label: "Categories",
    path: "/categories/list",
    icon: MdCategory,
    match: "/categories",
    roles: ["admin"],
  },
  {
    label: "Brands",
    path: "/brands/list",
    icon: MdGroup,
    match: "/brands",
    roles: ["admin"],
  },
  {
    label: "Inventory",
    path: "/inventory",
    icon: MdShoppingCart,
    roles: ["admin"],
  },
    {
    label: "Inventory",
    path: "/manage-inventory",
    icon: MdShoppingCart,
    roles: ["storeManager"],
    children: [
      { label: "My Inventory", path: "/manage-inventory/list" },
      { label: "Add Inventory", path: "/manage-inventory/create" },
    ],
  },
  {
    label: "Orders",
    path: "/orders/list",
    icon: MdReceiptLong,
    match: "/orders",
    roles: ["admin"],
  },
  {
    label: "Invoices",
    path: "/invoices/list",
    icon: MdReceipt,
    match: "/invoices",
    roles: ["admin"],
  },
  {
    label: "Banners",
    icon: MdViewCarousel,
    match: "/banners",
    roles: ["admin"],
    path:"/banners"
  },
  {
    label: "Coupons",
    icon: MdCardGiftcard,
    match: "/coupons",
    roles: ["admin"],
    children: [
      { label: "All Coupons", path: "/coupons/list" },
      { label: "Add Coupon", path: "/coupons/create" },
      { label: "Coupon Analytics", path: "/coupons/analystics" },
    ],
  },
  {
    label: "Customers",
    icon: MdGroup,
    match: "/customers",
    roles: ["admin"],
    children: [
      { label: "All Customers", path: "/customers/list" },
      { label: "Referral Dashboard", path: "/customers/refferal" },
    ],
  },
    {
    label: "Stores",
    icon: MdGroup,
    match: "/store",
    roles: ["admin"],
    children: [
      { label: "All Stores", path: "/stores/list" },
      { label: "Add Store", path: "/stores/create" },

    ],
  },
  {
    label: "Notifications",
    icon: MdNotificationAdd,
    match: "/notifications",
    roles: ["admin"],
    children: [
      { label: "Notifications", path: "/notifications" },
      { label: "Notification Logger", path: "/notification-logger" },
    ],
  },
  {
    label: "Payments",
    path: "/payments",
    icon: MdPayments,
    roles: ["admin"],
  },
  {
    label: "Service Requests",
    path: "/service-requests",
    icon: MdMiscellaneousServices,
    match: "/service-requests",
    roles: ["admin"],
  },
  {
    label: "Blogs",
    path: "/blogs",
    icon: MdArticle,
    match: "/blogs",
    roles: ["admin"],
  },
  {
    label: "Roles",
    path: "/roles",
    icon: MdAdminPanelSettings,
    match: "/roles",
    roles: ["admin"],
  },
  {
    label: "Settings",
    path: "/settings",
    icon: MdSettings,
    roles: ["admin"],
  },
  {
    label: "Profile",
    path: "/profile",
    icon: MdPerson,
    roles: ["admin", "storeManager"],
  },
];

export default sidebarLinks;
