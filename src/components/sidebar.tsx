import clsx from "clsx";
import { useNavigate } from "react-router";
import { Logo } from "./logo";
import { Button } from "./button";

import type { LucideIcon } from "lucide-react";
import {
  LogOut,
  MenuIcon,
  SquareCheckBig,
  Telescope,
  BellRing,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/auth";

const NavItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: MenuIcon,
  },
  {
    name: "Projects",
    path: "/projects",
    icon: SquareCheckBig,
  },
  {
    name: "Explore",
    path: "/explore",
    icon: Telescope,
  },
  {
    name: "Messages",
    path: "/messages",
    icon: BellRing,
  },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [showUserMenu, setShowUserMenu] = useState(false);

  let active: number;
  NavItems.forEach((navItem, i) => {
    if (window.location.pathname === navItem.path) {
      active = i;
    }
  });

  const initials = user
    ? user.displayName
      ? user.displayName[0].toUpperCase()
      : user.username[0].toUpperCase()
    : "U";

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-56 flex-col bg-bg-surface border-r border-border shrink-0">
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-border shrink-0">
          <Logo />
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {NavItems.map((navitem, i) => (
            <NavItem
              key={`${navitem.name}-${i}`}
              active={active === i}
              icon={navitem.icon}
              onClick={() => navigate(navitem.path)}
            >
              {navitem.name}
            </NavItem>
          ))}
        </nav>

        {/* User footer */}
        <div className="shrink-0 border-t border-border p-2 space-y-1">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition duration-fast hover:bg-bg-elevated focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <div className="h-7 w-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs font-semibold text-emerald-300 shrink-0 ring-1 ring-emerald-500/30">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text-primary leading-tight">
                {user?.displayName}
              </p>
              <p className="truncate text-xs text-text-muted leading-tight">
                {user?.email}
              </p>
            </div>
          </button>

          <Button
            variant="danger"
            className="w-full gap-1.5"
            onClick={handleLogout}
          >
            <LogOut size={13} />
            Sign out
          </Button>
        </div>
      </aside>

      {/* ── Mobile bottom nav ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-900 border-t border-zinc-800">
        <div className="relative">
          <nav className="flex items-center justify-between px-3 h-16">
            {NavItems.map((navitem, i) => (
              <MobileNavItem
                key={`${navitem.name}-${i}`}
                active={active === i}
                icon={navitem.icon}
                onClick={() => navigate(navitem.path)}
              >
                {navitem.name}
              </MobileNavItem>
            ))}

            <button
              onClick={() => setShowUserMenu((prev) => !prev)}
              className="relative flex flex-col items-center justify-center gap-1 py-1.5 rounded-md w-full transition duration-fast cursor-pointer hover:bg-zinc-800 group"
            >
              <div className="h-4.5 w-4.5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-semibold text-emerald-400 ring-1 ring-zinc-700 group-hover:ring-emerald-500 transition duration-fast">
                {initials}
              </div>
              <span className="text-[10px] font-medium leading-none text-zinc-500 group-hover:text-zinc-300 transition duration-fast">
                Account
              </span>
            </button>
          </nav>

          {showUserMenu && (
            <div className="absolute bottom-18 right-2 z-50 w-auto min-w-55 rounded-xl border border-border bg-zinc-950/95 shadow-lg backdrop-blur-sm animate-slide-up">
              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(false);
                  navigate("/profile");
                }}
                className="flex w-full cursor-pointer items-center gap-3 border-b border-border px-3 py-3 text-left transition hover:bg-zinc-800/80"
              >
                <div className="h-9 w-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-sm font-semibold text-emerald-300 ring-1 ring-emerald-500/30 shrink-0">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text-primary">
                    {user?.displayName}
                  </p>
                  <p className="truncate text-xs text-text-muted">
                    {user?.email}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(false);
                  handleLogout();
                }}
                className="flex w-full cursor-pointer items-center gap-2 px-3 py-3 text-left text-red-400 transition hover:bg-red-950/30"
              >
                <LogOut size={15} />
                <span className="text-sm">Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function NavItem({
  children,
  active,
  icon: Icon,
  onClick = () => {},
}: {
  children: string;
  active?: boolean;
  icon?: LucideIcon;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm cursor-pointer transition-all duration-fast select-none",
        active
          ? "bg-zinc-800 text-zinc-100 font-medium"
          : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300",
      )}
    >
      {Icon && (
        <Icon
          size={15}
          className={clsx(
            "shrink-0 transition-colors duration-150",
            active
              ? "text-emerald-400"
              : "text-zinc-600 group-hover:text-zinc-400",
          )}
        />
      )}
      <span className="truncate">{children}</span>
      {active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
      )}
    </div>
  );
}

function MobileNavItem({
  children,
  active,
  icon: Icon,
  onClick = () => {},
}: {
  children: string;
  active?: boolean;
  icon?: LucideIcon;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "relative flex flex-col items-center justify-center gap-1 py-1.5 rounded-md transition duration-fast select-none cursor-pointer w-full",
        active ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300",
      )}
    >
      {active && <span className="absolute inset-0 rounded-md bg-zinc-800" />}

      {/* Icon wrapper — dot anchored to icon */}
      <span className="relative">
        {Icon && (
          <Icon
            size={18}
            className={clsx(
              "relative shrink-0 transition duration-fast",
              active ? "text-emerald-400" : "text-zinc-500",
            )}
          />
        )}
        {active && (
          <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
        )}
      </span>

      <span className="relative text-[10px] font-medium leading-none truncate">
        {children}
      </span>
    </button>
  );
}
