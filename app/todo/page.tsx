import NavBar from "../_components/navbar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ToDoCard from "../_components/todo-card";
import { db } from "../_lib/prisma";

const TodoPage = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

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
  });

  return (
    <>
      <NavBar />
      <div className="flex justify-center items-center p-2">
        {todos && <ToDoCard todos={todos} profile="user" />}
      </div>
    </>
  );
};

export default TodoPage;
