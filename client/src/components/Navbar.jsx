// ============================
// Navbar.jsx
// Rift Eye - Muling Detector
// ============================

import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full fixed top-0 left-0 z-50 backdrop-blur-md bg-white/70 border-b border-black/10">

      {/* ================= CONTAINER ================= */}
      <div className="w-full px-4 sm:px-6 lg:px-10">

        <div className="h-16 flex items-center justify-between">

          {/* ================= LOGO ================= */}
          <div className="flex flex-col leading-tight">
            <span className="text-sm md:text-base tracking-widest uppercase font-semibold">
              Rift Eye
            </span>

            <span className="text-[10px] opacity-60 tracking-[0.25em] uppercase">
              Muling Detector
            </span>
          </div>

          {/* ================= DESKTOP NAV ================= */}
          <div className="hidden md:flex items-center gap-8 text-xs tracking-widest uppercase">

            <button className="hover:opacity-60 transition">
              Dashboard
            </button>

            <button className="hover:opacity-60 transition">
              Analysis
            </button>

            <button className="hover:opacity-60 transition">
              Reports
            </button>

          </div>

          {/* ================= MOBILE MENU BTN ================= */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {open && (
        <div className="md:hidden border-t border-black/10 bg-white/90 backdrop-blur-md">

          <div className="flex flex-col px-6 py-5 gap-5 text-xs tracking-widest uppercase">

            <button className="text-left">Dashboard</button>
            <button className="text-left">Analysis</button>
            <button className="text-left">Reports</button>

          </div>
        </div>
      )}
    </nav>
  );
}