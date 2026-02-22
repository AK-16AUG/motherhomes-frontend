import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  ChevronDown,
  LayoutGrid,
  Calendar,
  Building,
  Users,
  MoreHorizontal
} from "lucide-react";
import home from "../assets/home-icon.png";

interface NavItem {
  icon: React.ReactNode;
  name: string;
  path?: string;
  pro?: boolean;
  new?: boolean;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
}

const AppSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  // Authentication check
  useEffect(() => {
    if (!role) {
      if (location.pathname !== "/signin") {
        navigate("/signin");
      }
    }
  }, [role, location.pathname, navigate]);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [isExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen] = useState(false);

  const navItems: NavItem[] = role === "admin" || role === "superadmin"
    ? [
      {
        icon: <LayoutGrid className="w-5 h-5" />,
        name: "Dashboard",
        path: "/dashboard",
        pro: false,
      },
      {
        icon: <Building className="w-5 h-5" />,
        name: "Inventory",
        path: "/inventory",
        subItems: [
          { name: "All Listings", path: "/alllisting", pro: false },
          { name: "Add Listing", path: "/addlisting", pro: false },
        ],
      },
      {
        icon: <Users className="w-5 h-5" />,
        name: "Leads",
        path: "/leads",
        pro: false,
      },
      {
        icon: <Users className="w-5 h-5" />,
        name: "Tenants",
        path: "/alllisting",
        pro: false,
      },
      {
        icon: <Users className="w-5 h-5" />,
        name: "Users",
        path: "/users",
        pro: false,
      },
      {
        icon: <Calendar className="w-5 h-5" />,
        name: "Appointments",
        path: "/appointments",
        subItems: [
          { name: "All Appointments", path: "/appointments", pro: false },
          { name: "Schedule / Edit", path: "/editappointments", pro: false },
        ],
      },
      {
        icon: <Calendar className="w-5 h-5" />,
        name: "Calendar",
        path: "/calendar",
        pro: false,
      },
    ]
    : role === "user"
      ? [
        {
          icon: <LayoutGrid className="w-5 h-5" />,
          name: "Dashboard",
          path: "/profile",
          pro: false,
        },
        {
          icon: <Building className="w-5 h-5" />,
          name: "My Flat",
          path: "/infotenant",
          pro: false,
        },
        {
          icon: <Calendar className="w-5 h-5" />,
          name: "Appointments",
          path: "/appointments",
          pro: false,
        },
      ]
      : [];

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({ type: "main", index });
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `main-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (prevOpenSubmenu && prevOpenSubmenu.index === index) {
        return null;
      }
      return { type: "main", index };
    });
  };

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index)}
              className={`menu-item group ${openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={`menu-item-icon-size  ${openSubmenu?.index === index
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
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.index === index
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
                subMenuRefs.current[`main-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.index === index
                    ? `${subMenuHeight[`main-${index}`]}px`
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
              {renderMenuItems(navItems)}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
