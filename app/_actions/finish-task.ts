"use server";
import { db } from "../_lib/prisma";
import { auth } from "@clerk/nextjs/server";

export const finishTask = async (todoId: string) => {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const todo = await db.todo.findFirst({
    where: {
      id: todoId,
      worker: userId,
    },
  });

  if (!todo) {
    return null;
  }

  return db.todo.update({
    where: {
      id: todoId,
    },
    data: {
      status: "CLOSED",
    },
  });
};
