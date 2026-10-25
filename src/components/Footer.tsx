import { useEffect, useState } from "react";
import type { FC } from "react";
import type { IconType } from "react-icons";
import { useLocation, useNavigate } from "react-router-dom";
import {
  IoHome,
  IoGrid,
  IoStorefront,
  IoCart,
  IoPerson,
} from "react-icons/io5";
import { getCart, CART_UPDATED_EVENT } from "../pages/Cart"; // adjust the path if needed

interface NavItem {
  label: string;
  path: string;
  Icon: IconType;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: "Home", path: "/home", Icon: IoHome, badge: 5 },
  // The design shows the red badge on the Category tab
  { label: "Category", path: "/category", Icon: IoGrid, badge: 1 },
  { label: "Orders", path: "/orders", Icon: IoStorefront },
  { label: "Cart", path: "/cart", Icon: IoCart }, // its badge comes from the saved cart
  { label: "Account", path: "/account", Icon: IoPerson },
];

const Footer: FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Number of items in the cart, kept in sync as the cart changes
  const [cartCount, setCartCount] = useState<number>(() => getCart().length);

  useEffect(() => {
    const syncCount = () => setCartCount(getCart().length);

    syncCount();
    window.addEventListener(CART_UPDATED_EVENT, syncCount); // changes in this tab
    window.addEventListener("storage", syncCount); // changes in another tab

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, syncCount);
      window.removeEventListener("storage", syncCount);
    };
  }, []);

  // A tab is active on its own route and on any nested route,
  // e.g. /category/fruits-vegetables keeps "Category" highlighted.
  // "/" is treated as Home as well.
  const isActivePath = (path: string) => {
    if (path === "/home" && pathname === "/") return true;
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 bg-[#F3EDF7]">
      <ul className="mx-auto flex max-w-160 items-center justify-around px-2 pb-4 pt-3">
        {navItems.map(({ label, path, Icon, badge }) => {
          const isActive = isActivePath(path);

          // The Cart tab uses the live count; the others keep their fixed badge
          const count = path === "/cart" ? cartCount : badge;

          return (
            <li key={label}>
              <button
                type="button"
                onClick={() => navigate(path)}
                aria-current={isActive ? "page" : undefined}
                className="flex flex-col items-center gap-1 font-jakarta text-[#1A2B4C]"
              >
                <span
                  className={`relative flex h-8 w-16 items-center justify-center rounded-full ${
                    isActive ? "bg-[#E6DDF4]" : ""
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  {count !== undefined && count > 0 && (
                    <span className="absolute -top-0.5 left-[54%] flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E5322D] px-1 text-[10px] font-semibold leading-none text-white">
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                </span>
                <span
                  className={`text-[12px] ${
                    isActive ? "font-bold" : "font-medium"
                  }`}
                >
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Footer;
