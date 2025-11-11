import { auth } from "@clerk/nextjs/server";
import NavBar from "../_components/navbar";
import { redirect } from "next/navigation";
import ToDoCard from "../_components/todo-card";
import { db } from "../_lib/prisma";
import type { Prisma } from "@prisma/client";


interface ClerkUser {
  email: string | null;
  id: string;
  role: string | null;
  phone: string | null;
}

const AllTodoPage = async ({
  searchParams,
}: {
  searchParams: { page?: string, search?: string };
}) => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const page = Number(searchParams.page) || 1;
  const searchQuery = searchParams.search || "";
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const clerkUsersResponse = await fetch(
    `${
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    }/api/clerkusers`,
    { cache: "no-store" }
  );
  const clerkUsers = await clerkUsersResponse.json();

  const users = clerkUsers.map(
    (user: {
      email_addresses: { email_address: string }[];
      id: string;
      public_metadata: { role?: string; phone?: string };
    }) => ({
      email: user.email_addresses?.[0].email_address || null,
      id: user.id,
      role: user.public_metadata?.role || null,
      phone: user.public_metadata?.phone || null,
    })
  );
  let workerIds: string[] = [];
  if (searchQuery) {
    workerIds = users
      .filter((user: ClerkUser) => 
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((user: ClerkUser) => user.id);
  }

  const whereClause: Prisma.TodoWhereInput = {
    AND: [
      { status: "CLOSED" },
      ...(searchQuery && workerIds.length > 0
        ? [{ worker: { in: workerIds } }]
        : searchQuery && workerIds.length === 0
        ? [{ worker: "id-inexistente" }]
        : []),
    ],
  };

  const totalClosedTodos = await db.todo.count({
    where: whereClause,
  });

  const todos = await db.todo.findMany({
    where: whereClause,
    skip: skip,
    take: pageSize,
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalPages = Math.ceil(totalClosedTodos / pageSize);

  return (
    <>
      <NavBar />
      <div className="flex justify-center items-center p-2 sm:p-4 md:p-6 w-full">
        <div className="w-full max-w-7xl">{todos && 
        <ToDoCard todos={todos} profile="closed" users={users}
         currentPage={page} totalPages={totalPages} />}
        </div>
      </div>
    </>
  );
};

export default AllTodoPage;
