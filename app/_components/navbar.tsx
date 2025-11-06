"use client";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";

const NavBar = () => {
  const { user, isLoaded } = useUser();
  const role = user?.publicMetadata.role;
  const [admin, setAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isLoaded && role !== "admin") {
      setAdmin(false);
    }
    if (isLoaded && role === "admin") {
      setAdmin(true);
    }
  }, [role, isLoaded]);

  console.log("role", role);
  return (
    <nav className="flex justify-between items-center border-b border-solid px-4 sm:px-8 py-4 relative">
      {/* Menu Hambúrguer - Mobile */}
      <div className="flex md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-gray-700"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Links Desktop */}
      <div className="hidden md:flex items-center gap-10">
        {admin && <Link href="/all">Todas as Tarefas</Link>}
        <Link href="/todo">Minhas Tarefas</Link>
        {admin && <Link href="/closed">Tarefas Fechadas</Link>}
      </div>

      {/* Menu Mobile - Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b shadow-lg md:hidden z-50">
          <div className="flex flex-col p-4 gap-4">
            {admin && (
              <Link
                href="/all"
                onClick={() => setIsMenuOpen(false)}
                className="hover:bg-gray-100 p-2 rounded"
              >
                Todas as Tarefas
              </Link>
            )}
            <Link
              href="/todo"
              onClick={() => setIsMenuOpen(false)}
              className="hover:bg-gray-100 p-2 rounded"
            >
              Minhas Tarefas
            </Link>
            {admin && (
              <Link
                href="/closed"
                onClick={() => setIsMenuOpen(false)}
                className="hover:bg-gray-100 p-2 rounded"
              >
                Tarefas Fechadas
              </Link>
            )}
          </div>
        </div>
      )}

      {/* UserButton */}
      <div>
        <UserButton showName />
      </div>
    </nav>
  );
};

export default NavBar;
