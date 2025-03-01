import { auth } from "@clerk/nextjs/server";
import NavBar from "../_components/navbar";
import { redirect } from "next/navigation";
import ToDoCard from "../_components/todo-card";
import { db } from "../_lib/prisma";

const AllTodoPage = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const todos = await db.todo.findMany({
    where: {
      OR: [
        {
          status: "OPEN",
        },
        {
          status: "INPROGRESS",
        },
      ],
    },
  });

  const clerkUsersResponse = await fetch(
    `${
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    }/api/clerkusers`,
    { cache: "no-store" }
  );
  const clerkUsers = await clerkUsersResponse.json();

  const users = clerkUsers.map(
    (user: { email_addresses: { email_address: string }[]; id: string }) => ({
      email: user.email_addresses?.[0].email_address || null,
      id: user.id,
    })
  );

  return (
    <>
      <NavBar />
      <div className="flex justify-center items-center p-2">
        {todos && <ToDoCard todos={todos} profile="all" users={users} />}
      </div>
    </>
  );
};

export default AllTodoPage;
