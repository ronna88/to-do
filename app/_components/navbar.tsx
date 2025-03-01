import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

const NavBar = () => {
  return (
    <nav className="flex justify-between border-b border-solid px-8 py-4">
      <div className="flex items-center gap-10">
        <Link href="/all">Todas as Tarefas</Link>
        <Link href="/todo">Minhas Tarefas</Link>
      </div>
      <div>
        <UserButton showName />
      </div>
    </nav>
  );
};

export default NavBar;
