import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Link from "./Link";
import { getStoredAuth } from "../utils/auth";
import { MdLogout } from "react-icons/md";
import { MdExpandMore, MdExpandLess } from "react-icons/md";

export default function Sidebar({ onLogout }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const location = useLocation();

  const { role } = getStoredAuth() || {};
  const base = role === "storeManager" ? "/store" : "/admin";

  const visibleLinks = Link.filter((item) => {
    const allowed = item.roles ?? ["admin", "storeManager"]; // default: show to both
    if (!allowed.includes(role)) return false;

    if (item.children) {
      const children = item.children.filter((c) => (c.roles ?? allowed).includes(role));
      return !!item.path || children.length > 0;
    }

    return true;
  });

  const makeFull = (p) => {
    if (!p) return base;
    const clean = p.replace(/^\/+/, "");
    return `${base}/${clean}`;
  };

  const isActive = (item) => {
    const fullMatch = item.match ? makeFull(item.match) : makeFull(item.path);
    return location.pathname.startsWith(fullMatch.replace(/\/$/, ""));
  };

  const toggleDropdown = (index) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleNavClick = () => {
    // Close mobile menu when a nav item is clicked
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        className="fixed md:hidden top-4 left-4 z-40 rounded hover:bg-gray-900 text-white font-bold flex items-center justify-center w-10 h-10 bg-black border border-gray-700"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      {/* Sidebar */}
      <div
        className={` bg-black
      fixed md:relative top-0 left-0 h-screen
      shadow-lg 
      transform transition-transform duration-300 z-50
      ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
      md:translate-x-0
      overflow-hidden scrollbar-hide flex flex-col
      ${isMobileOpen ? "w-64" : isCollapsed ? "w-20" : "w-64"}
    `}
        onMouseEnter={() => !isMobileOpen && setIsCollapsed(false)}
        onMouseLeave={() => !isMobileOpen && setIsCollapsed(true)}
      >
        {/* SIDEBAR HEADER */}
        <div className="sidebar-header p-4 border-b border-gray-700 ">
          <div className="sidebar-logo flex items-center gap-2">
            <div className="logo-icon ">
              <img
                className="logo-image w-8 h-8"
                src="https://dapper-maamoul-8bc20d.netlify.app/image/Mittronix-logo-black.png"
                alt="Logo"
              />
            </div>
            {(isMobileOpen || !isCollapsed) && (<span className="font-bold text-white text-xl whitespace-nowrap ">Mittronix</span>)}
            {/* Close button for mobile */}
            <button
              className="md:hidden text-white text-xl font-bold ml-auto "
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>
        </div>

        {/* MAIN NAVIGATION - SCROLLABLE */}
        
        <div className=" flex-1 overflow-y-auto scrollbar-hide text-white">
          {visibleLinks.map((item, index) => {
            const Icon = item.icon;
            const isDropdown = item.children && item.children.length > 0;
            const isOpen = openDropdowns[index];
            const itemIsActive = isActive(item);

            if (isDropdown) {
              return (
                <div
                  key={index}
                  className={`nav-group ${
                    itemIsActive ? " border-l-4 border-blue-400" : ""
                  }`}
                >
                  {/* Dropdown Toggle Button */}
                  <button
                    onClick={() => toggleDropdown(index)}
                    className={`w-full nav-item flex items-center justify-between px-4 py-3 hover:bg-gray-900 transition text-white ${
                      itemIsActive ? "text-blue-400 font-semibold bg-gray-900" : ""
                    }`}
                    title={isCollapsed ? item.label : ""}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="nav-icon  flex items-center justify-center">
                        <Icon size={20} />
                      </span>
                      {(isMobileOpen || !isCollapsed) && (
                        <span className="text-sm whitespace-nowrap">{item.label}</span>
                      )}
                    </div>
                    {(isMobileOpen || !isCollapsed) && (
                      <span className=" transition-transform ">
                        {isOpen ? (
                          <MdExpandLess size={18} />
                        ) : (
                          <MdExpandMore size={18} />
                        )}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Items */}
                  {isOpen && (isMobileOpen || !isCollapsed) && (
                    <div className="nav-sublist border-l-2 border-gray-700 bg-gray-900">
                      {item.children.map((child, childIndex) => (
                        <NavLink
                          key={childIndex}
                          to={makeFull(child.path)}
                          className={({ isActive: linkIsActive }) =>
                            `nav-subitem px-4 py-2 text-xs flex items-center gap-2 transition text-gray-300 ${
                              linkIsActive
                                ? "text-blue-400 font-semibold bg-gray-800"
                                : "hover:bg-gray-800"
                            }`
                          }
                          onClick={handleNavClick}
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // Regular NavLink
            return (
              <NavLink
                key={index}
                to={makeFull(item.path)}
                className={({ isActive: linkIsActive }) =>
                  `nav-item flex items-center gap-3 px-4 py-3 hover:bg-gray-900 transition text-gray-300 justify-start ${
                    linkIsActive
                      ? "bg-gray-900 text-blue-400 border-l-4 border-blue-400 font-semibold"
                      : ""
                  }`
                }
                onClick={handleNavClick}
                title={isCollapsed ? item.label : ""}
              >
                <span className="nav-icon  flex items-center justify-center">
                  <Icon size={20} />
                </span>
                {(isMobileOpen || !isCollapsed) && (
                  <span className="text-sm whitespace-nowrap">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Logout Button - Sticky at Bottom */}
        <div className="border-t border-gray-700 p-4 ">
          <button
            onClick={() => {
              onLogout();
              setIsMobileOpen(false);
            }}
            className="w-full nav-item flex items-center gap-3 px-4 py-3 hover:bg-red-900 text-red-400 rounded transition justify-start"
            title={isCollapsed ? "Logout" : ""}
          >
            <span className="nav-icon  flex items-center justify-center">
              <MdLogout size={20} />
            </span>
            {(isMobileOpen || !isCollapsed) && (
              <span className="text-sm font-semibold">Logout</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden z-40"
          onClick={() => setIsMobileOpen(false)}
        />
        
      )}
    </>
  );
}
