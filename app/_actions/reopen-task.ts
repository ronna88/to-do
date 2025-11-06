"use server";
import { db } from "../_lib/prisma";
import { auth } from "@clerk/nextjs/server";

export const reOpenTask = async (todoId: string) => {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  return db.todo.update({
    where: {
      id: todoId,
    },
    data: {
      status: "OPEN",
    },
  });
};
