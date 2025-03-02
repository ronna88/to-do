"use client";
import { Todo } from "@prisma/client";
import { Card, CardTitle, CardContent } from "./ui/card";
import { useUser } from "@clerk/nextjs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { finishTask } from "../_actions/finish-task";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useState } from "react";
import { transferTask } from "../_actions/transfer-task";

interface ToDoCardProps {
  todos: Todo[];
  profile: "user" | "all";
  users?: { email: string; id: string }[];
}

const ToDoCard = ({ todos, profile, users }: ToDoCardProps) => {
  const { user } = useUser();
  const role = user?.publicMetadata.role;
  const [selectedUser, setSelectedUser] = useState<string | undefined>(
    undefined
  );

  const handleTransferTask = async (todoId: string) => {
    if (!selectedUser) {
      toast.error("Selecione um funcionário para transferir a tarefa.");
      return;
    }
    await transferTask(todoId, selectedUser);
    toast.success("Tarefa transferida com sucesso!");
    setTimeout(() => {
      location.reload();
    }, 2000);
  };

  const handleFinishTask = async (todoId: string) => {
    await finishTask(todoId);
    toast.success("Tarefa finalizada com sucesso!");
    setTimeout(() => {
      location.reload();
    }, 2000);
  };

  return (
    <Card className="mt-4 w-4/5 p-4">
      <CardTitle>
        {profile === "all" ? "Todas as Tarefas" : "Minhas Tarefas"}
      </CardTitle>
      <CardContent className="flex flex-col gap-4 mt-8">
        {todos?.map((todo) => (
          <div key={todo.id} className="flex justify-between">
            <span>{todo.description} </span>
            {profile === "all" ? (
              <div className="flex gap-2 justify-center items-center">
                <span>{users?.find((u) => u.id === todo.worker)?.email}</span>
                {role === "admin" && (
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="rounded-full" variant="outline">
                          Transferir Tarefa
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Transferir Tarefa</DialogTitle>
                        </DialogHeader>
                        <Select
                          value={selectedUser}
                          onValueChange={(value) => setSelectedUser(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um funcionário" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Funcionários</SelectLabel>
                              {users?.map((u) => (
                                <SelectItem key={u.id} value={u.id}>
                                  {u.email}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <DialogFooter>
                          <Button
                            onClick={() => handleTransferTask(todo.id)}
                            className="rounded-full"
                          >
                            Transferir
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button>Finalizar</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          Deseja realmente finalizar a tarefa?
                        </AlertDialogHeader>
                        <AlertDialogDescription>
                          Esta ação não poderá ser desfeita.
                        </AlertDialogDescription>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleFinishTask(todo.id)}
                        >
                          Finalizar
                        </AlertDialogAction>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>Finalizar</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    Deseja realmente finalizar a tarefa?
                  </AlertDialogHeader>
                  <AlertDialogDescription>
                    Esta ação não poderá ser desfeita.
                  </AlertDialogDescription>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleFinishTask(todo.id)}>
                    Finalizar
                  </AlertDialogAction>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ToDoCard;
