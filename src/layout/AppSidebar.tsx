import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Calendar,
  User,
  Plus,
  Building2,
  Edit3,
  Home,
  // Users,
  ChevronDown,
  MoreHorizontal,
  Shield,
  Table,
} from "lucide-react";

import { useSidebar } from "../context/SidebarContext";
import home from "../assets/home-icon.png";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, []);

  useEffect(() => {
    if (
      role === "user" &&
      (location.pathname === "/dashboard" || location.pathname === "/")
    ) {
      navigate("/profile", { replace: true });
    }
  }, [role, location.pathname, navigate]);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const baseNavItems: NavItem[] = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      name: "Dashboard",
      subItems: [{ name: "Main", path: "/dashboard", pro: false }],
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      name: "Calendar",
      path: "/calendar",
    },
    {
      icon: <User className="w-5 h-5" />,
      name: "User Profile",
      path: "/profile",
    },
    {
      name: "Add listing",
      icon: <Plus className="w-5 h-5" />,
      subItems: [{ name: "Add property", path: "/addlisting", pro: false }],
    },
    {
      name: "Listing",
      icon: <Building2 className="w-5 h-5" />,
      subItems: [{ name: " All Listing", path: "/alllisting", pro: false }],
    },
    {
      name: "Appointment Edit",
      icon: <Edit3 className="w-5 h-5" />,
      subItems: [
        { name: " Edit Appoinment", path: "/editappointments", pro: false },
      ],
    },
    {
      name: "Registered Users",
      icon: <Table className="w-5 h-5" />,
      subItems: [
        { name: "Users", path: "/allregistereduser", pro: false },
      ],
    },
    {
      name: "Leads",
      icon: <Table className="w-5 h-5" />,
      subItems: [
        { name: "All Leads", path: "/leads", pro: false },
      ],
    },
    {
      name: "Flats Details",
      icon: <Home className="w-5 h-5" />,
      subItems: [{ name: " Tenant Info", path: "/tenantinfo", pro: false }],
    },
    // {
    //   name: "Tenant",
    //   icon: <Users className="w-5 h-5" />,
    //   subItems: [{ name: "All Tenant", path: "/leads", pro: false }],
    // },
    // Admin Management link for superadmin only (added at the end)
    {
      icon: <Shield className="w-5 h-5" />,
      name: "Admin Management",
      path: "/admin-management",
    },
  ];

  let navItems: NavItem[] = [];
  if (role === "superadmin") {
    navItems = baseNavItems;
  } else if (role === "admin") {
    // Exclude the Admin Management link for admin
    navItems = baseNavItems.filter((item) => item.path !== "/admin-management");
  } else {
    navItems = [
      {
        icon: <User className="w-5 h-5" />,
        name: "User Profile",
        path: "/profile",
      },
      {
        name: "Appointments",
        icon: <Calendar className="w-5 h-5" />,
        path: "/appointments",
      },
      {
        name: "Flat info",
        icon: <Home className="w-5 h-5" />,
        path: "/infotenant",
      },
    ];
  }

  const othersItems: NavItem[] =
    role === "admin"
      ? [
        // {
        //   icon: <PieChartIcon />,
        //   name: "Charts",
        //   subItems: [
        //     { name: "Line Chart", path: "/line-chart", pro: false },
        //     { name: "Bar Chart", path: "/bar-chart", pro: false },
        //   ],
        // },
      ]
      : [];

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={`menu-item-icon-size  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDown
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                      ? "rotate-180 text-yellow-500"
                      : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`menu-item-icon-size ${isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed flex flex-col top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[250px]"
          : isHovered
            ? "w-[250px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-6 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link to="/" className="hidden lg:block text-xl font-bold">
          <div className="flex gap-2 justify-center items-center dark:text-white">
            <img src={home} alt="logo" className="w-6 h-6" />
            {(isExpanded || isHovered) && "MotherHome"}
          </div>
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <MoreHorizontal className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                  }`}
              >
                {/* {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <HorizontaLDots />
                )} */}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
