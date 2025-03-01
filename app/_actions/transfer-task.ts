"use server";
import { db } from "../_lib/prisma";
import { auth } from "@clerk/nextjs/server";

export const transferTask = async (todoId: string, selectedUserId: string) => {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  return db.todo.update({
    where: {
      id: todoId,
    },
    data: {
      worker: selectedUserId,
    },
  });
};
