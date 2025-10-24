import React, { useEffect, useRef, useState } from "react";

export default function Navbar({
  userName = "Marta Tagowska",
  onProfile = () => {},
  onSettings = () => {},
  onLogout = () => {},
}: {
  userName?: string;
  onProfile?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current || !btnRef.current) return;
      const target = e.target as Node;
      if (!menuRef.current.contains(target) && !btnRef.current.contains(target)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const initials = userName
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <nav className="w-full bg-purple-800 sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <a href="#" className="flex items-center gap-2 shrink-0">
              <span className="font-semibold tracking-tight text-gray-900 dark:text-white truncate">Hack & Play</span>
            </a>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a href="#home" className="nav-link text-gray-200">Home</a>
            <a href="#about" className="nav-link text-gray-200">About</a>
            <a href="#offers" className="nav-link text-gray-200">Offers</a>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="md:hidden inline-flex items-center justify-center rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:focus-visible:ring-white/30"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((v) => !v)}
            >
              <Hamburger open={mobileOpen} />
            </button>

            <div className="relative">
              <button
                ref={btnRef}
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="group inline-flex items-center gap-3 rounded-2xl px-2 py-1.5 hover:bg-purple-700 cursor-pointer dark:hover:border-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:focus-visible:ring-white/30"
              >
                <span className="hidden sm:block max-w-40 truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {userName}
                </span>
                <Avatar initials={initials} />
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
              </button>

              {menuOpen && (
                <div
                  ref={menuRef}
                  role="menu"
                  aria-label="User menu"
                  className="absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-white dark:bg-purple-700 focus:outline-none z-10"
                >
                  <MenuItem onClick={() => { setMenuOpen(false); onProfile(); }}>
                    <UserIcon className="h-4 w-4" />
                    <span>Profile</span>
                  </MenuItem>
                  <MenuItem onClick={() => { setMenuOpen(false); onSettings(); }}>
                    <SettingsIcon className="h-4 w-4" />
                    <span>Settings</span>
                  </MenuItem>
                  <div className="my-1 h-px bg-gray-200 dark:bg-gray-100" />
                  <MenuItem onClick={() => { setMenuOpen(false); onLogout(); }}>
                    <LogoutIcon className="h-4 w-4" />
                    <span>Log out</span>
                  </MenuItem>
                </div>
              )}
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-3">
            <div className="mt-2 space-y-1 rounded-2xl border border-gray-200 p-2 dark:border-gray-800">
              <a href="#home" className="mobile-link">Home</a>
              <a href="#about" className="mobile-link">About</a>
              <a href="#offers" className="mobile-link">Offers</a>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .nav-link { @apply text-sm font-medium text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors; }
        .mobile-link { @apply block rounded-xl px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800; }
      `}</style>
    </nav>
  );
}

function MenuItem({ children, onClick }: React.PropsWithChildren<{ onClick?: () => void }>) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100 dark:text-gray-100 dark:hover:bg-purple-400 dark:focus:bg-gray-800"
      role="menuitem"
    >
      {children}
    </button>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-purple-900 to-gray-700 text-white text-sm font-semibold shadow-sm dark:from-purple-100 dark:to-gray-300 dark:text-purple-900" aria-hidden>{initials}</span>
  );
}

function ChevronDown({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="#FFFF" className={className} aria-hidden>
      <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.18l3.71-2.95a.75.75 0 1 1 .94 1.16l-4.18 3.32a.75.75 0 0 1-.94 0L5.21 8.39a.75.75 0 0 1 .02-1.18z"/>
    </svg>
  );
}

function UserIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#FFFF" strokeWidth="1.8" className={className} aria-hidden>
      <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z"/>
      <path d="M3 21a9 9 0 0 1 18 0"/>
    </svg>
  );
}

function SettingsIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <path d="M12 15a3 3 0 1 0-3-3 3 3 0 0 0 3 3Z"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.12a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 1 1 3.21 17l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 1 1 0-4h.12a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 6.07 3.21l.06.06a1.65 1.65 0 0 0 1.82.33H8a1.65 1.65 0 0 0 1-1.51V2a2 2 0 1 1 4 0v.12a1.65 1.65 0 0 0 1 1.51h.05a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V8c0 .68.39 1.29 1.01 1.58.32.15.68.23 1.04.23H22a2 2 0 1 1 0 4h-.12c-.36 0-.72.08-1.04.23-.62.29-1.01.9-1.01 1.58Z"/>
    </svg>
  );
}

function LogoutIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <path d="M9 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2"/>
      <path d="M16 17l5-5-5-5"/>
      <path d="M21 12H9"/>
    </svg>
  );
}

function Hamburger({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden>
      {open ? (
        <path d="M6 6l12 12M6 18L18 6" />
      ) : (
        <>
          <path d="M3 6h18" />
          <path d="M3 12h18" />
          <path d="M3 18h18" />
        </>
      )}
    </svg>
  );
}
