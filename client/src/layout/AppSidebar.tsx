import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import axios from "axios";
import logoLiteon from '../components/ui/images/logo-liteon.png';
import { useAuth } from "../context/AuthContext";
import { API_CONFIG } from "../config/apiConfig";

// Assume these icons are imported from an icon library
import {
  BoxCubeIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  BoltIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";

/* ================= ✅ คอนเซปต์: ดึงคุกกี้โดยตรงเพื่อให้ Sidebar ยืนได้ด้วยตัวเอง ================= */
const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
};

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean; target?: string }[];
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { authData } = useAuth();
  const location = useLocation();

  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );
  
useEffect(() => {
  const masterIndex = navItems.findIndex(
    (m) => m.name.toLowerCase().includes("master")
  );

  if (masterIndex !== -1) {
    setOpenSubmenu({ type: "main", index: masterIndex });
  }
}, [navItems]);


  // ✅ ฟังก์ชันช่วยเลือกไอคอนตามชื่อเมนู
  const getIconByName = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("master")) return <GridIcon />;
    if (lowerName.includes("admin")) return <BoltIcon />;
    if (lowerName.includes("report")) return <BoxCubeIcon />;
    return <ListIcon />;
  };

  /* ================= ✅ หัวใจสำคัญ: ดึงเมนูจาก API (URL ใหม่) ================= */
  useEffect(() => {
    const fetchMenu = async () => {
      const empNo =
        getCookie("auth_employeeno") ||
        getCookie("employeeno") ||
        getCookie("auth_empno") ||
        "";

      if (!empNo) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);

        const url = API_CONFIG.MENU2.BY_USER(
          empNo,
          "DOApp",     
          "INBApp",  
          "Active"    
        );

        const res = await axios.get(url, {
          headers: {
            "X-API-KEY": API_CONFIG.MENU.KEY,
          },
        });

        if (res.data?.success === 1 && res.data.data?.[0]?.main) {
          const apiMenus = res.data.data[0].main;
          const mappedItems: NavItem[] = [];

          apiMenus.forEach((main: any) => {
            main.sub?.forEach((sub: any) => {
              sub.child?.forEach((child: any) => {
                if (child.chilD_NAME) {
                  mappedItems.push({
                    name: child.chilD_NAME,
                    icon: getIconByName(child.chilD_NAME),
                    subItems: child.leaf
                      ?.filter((l: any) => l.leaF_NAME)
                      .map((leaf: any) => {
                        let path = leaf.leaF_URL || "";
                        // if (path.includes(window.location.host)) {
                        //   try {
                        //     path = new URL(path).pathname;
                        //   } catch {}
                        // }
                        return {
                          name: leaf.leaF_NAME,
                          path,
                          target: leaf.leaF_TARGET || "_self",
                        };
                      }),
                  });
                }
              });
            });
          });

          // เมนูปิดท้าย
          mappedItems.push({
            icon: <HorizontaLDots />,
            name: "Contact",
            path: "/about",
          });

          setNavItems(mappedItems);
        }
      } catch (error) {
        console.error("❌ Sidebar fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  /* ================= UI Expansion Logic (เดิมทั้งหมด) ================= */
  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prev) => {
      if (prev && prev.type === menuType && prev.index === index) return null;
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems && nav.subItems.length > 0 ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
              }`}
            >
              <span className={`menu-item-icon-size`}>
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path)
                    ? "menu-item-active"
                    : "menu-item-inactive"
                }`}
              >
                <span className="menu-item-icon-size">{nav.icon}</span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems &&
            nav.subItems.length > 0 &&
            (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? `${subMenuHeight[`${menuType}-${index}`]}px`
                      : "0px",
                }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {nav.subItems.map((subItem) => (
                    <li key={subItem.name}>
                      {subItem.path.startsWith("http") ? (
                        <a
                          href={subItem.path}
                          target={subItem.target}
                          rel="noopener noreferrer"
                          className="menu-dropdown-item menu-dropdown-item-inactive"
                        >
                          {subItem.name}
                        </a>
                      ) : (
                        <Link
                          to={subItem.path}
                          className={`menu-dropdown-item ${
                            isActive(subItem.path)
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      )}
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
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <img className="dark:hidden" src={logoLiteon} alt="Logo" width={150} height={40} />
          ) : (
            <img src={logoLiteon} alt="Logo" width={32} height={32} />
          )}
          {(isExpanded || isHovered || isMobileOpen) && authData && (
            <div className="mt-4 text-gray-700 dark:text-gray-300 text-xs font-semibold">
              Hello, {authData.commonname}
            </div>
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
                {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots className="size-6" />}
              </h2>
              {loading ? (
                <div className="px-4 text-gray-400 text-xs">Loading menu...</div>
              ) : (
                renderMenuItems(navItems, "main")
              )}
            </div>
            <div>
              <h2 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
                {isExpanded || isHovered || isMobileOpen ? "Power By ITS" : <HorizontaLDots />}
              </h2>
            </div>
          </div>
        </nav>
        {(isExpanded || isHovered || isMobileOpen) && <SidebarWidget />}
      </div>
    </aside>
  );
};

export default AppSidebar;