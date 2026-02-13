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
  },
  {
    label: "Filter",
    path: "/filter",
    icon: MdFilterAlt,
  },
  {
    label: "Products",
    path: "/products/list",
    icon: MdShoppingBag,
    match: "/products",
  },
  {
    label: "Categories",
    path: "/categories/list",
    icon: MdCategory,
    match: "/categories",
  },
  {
    label: "Brands",
    path: "/brands/list",
    icon: MdGroup,
    match: "/brands",
  },
  {
    label: "Inventory",
    path: "/inventory",
    icon: MdShoppingCart,
  },
  {
    label: "Orders",
    path: "/orders/list",
    icon: MdReceiptLong,
    match: "/orders",
  },
  {
    label: "Invoices",
    path: "/invoices/list",
    icon: MdReceipt,
    match: "/invoices",
  },
  {
    label: "Banners",
    icon: MdViewCarousel,
    match: "/banners",
    children: [
      { label: "All Banners", path: "/banners" },
      { label: "Delay Banners", path: "/delay-banners" },
    ],
  },
  {
    label: "Coupons",
    icon: MdCardGiftcard,
    match: "/coupons",
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
    children: [
      { label: "All Customers", path: "/customer/list" },
      { label: "Referral Dashboard", path: "/customer/refferal" },
    ],
  },
    {
    label: "Stores",
    icon: MdGroup,
    match: "/stores",
    children: [
      { label: "All Stores", path: "/stores/list" },
      { label: "Add Store", path: "/stores/create" },

    ],
  },
  {
    label: "Notifications",
    icon: MdNotificationAdd,
    match: "/notifications",
    children: [
      { label: "Notifications", path: "/notifications" },
      { label: "Notification Logger", path: "/notification-logger" },
    ],
  },
  {
    label: "Payments",
    path: "/payments",
    icon: MdPayments,
  },
  {
    label: "Service Requests",
    path: "/service-requests",
    icon: MdMiscellaneousServices,
    match: "/service-requests",
  },
  {
    label: "Blogs",
    path: "/blogs",
    icon: MdArticle,
    match: "/blogs",
  },
  {
    label: "Roles",
    path: "/roles",
    icon: MdAdminPanelSettings,
    match: "/roles",
  },
  {
    label: "Settings",
    path: "/settings",
    icon: MdSettings,
  },
  {
    label: "Profile",
    path: "/profile",
    icon: MdPerson,
  },
];

export default sidebarLinks;
