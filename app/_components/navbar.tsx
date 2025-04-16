"use client";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const NavBar = () => {
  const { user, isLoaded } = useUser();
  const role = user?.publicMetadata.role;
  const [admin, setAdmin] = useState(false);

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
    <nav className="flex justify-between border-b border-solid px-8 py-4">
      <div className="flex items-center gap-10">
        {admin && <Link href="/all">Todas as Tarefas</Link>}
        <Link href="/todo">Minhas Tarefas</Link>
      </div>
      <div>
        <UserButton showName />
      </div>
    </nav>
  );
};

export default NavBar;
