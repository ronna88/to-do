import NavBar from "../_components/navbar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ToDoCard from "../_components/todo-card";
import { db } from "../_lib/prisma";

const TodoPage = async ({
  searchParams,
}: {
  searchParams: { page?: string, search?: string };
}) => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const page = Number(searchParams.page) || 1;
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const todos = await db.todo.findMany({
    where: {
      worker: userId,
      OR: [
        {
          status: "OPEN",
        },
        {
          status: "INPROGRESS",
        },
      ],
    },
    skip: skip,
    take: pageSize,
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalPages = Math.ceil(todos.length / pageSize);

  return (
    <>
      <NavBar />
      <div className="flex justify-center items-center p-2 sm:p-4 md:p-6 w-full">
        <div className="w-full max-w-7xl">{todos && 
          <ToDoCard todos={todos} profile="user" users={[]} 
          currentPage={page} totalPages={totalPages} />}
        </div>
      </div>
    </>
  );
};

export default TodoPage;
