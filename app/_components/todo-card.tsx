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
import { useEffect, useState } from "react";
import { transferTask } from "../_actions/transfer-task";
import { useRouter } from "next/navigation";
import { reOpenTask } from "../_actions/reopen-task";

interface ToDoCardProps {
  todos: Todo[];
  profile: "user" | "all" | "closed";
  users?: { email: string; id: string; phone?: string }[]; // Adiciona ? no phone
}

const ToDoCard = ({ todos, profile, users }: ToDoCardProps) => {
  const { user, isLoaded } = useUser();
  const role = user?.publicMetadata.role;
  // const phone = user?.publicMetadata.phone as string;
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && role !== "admin" && profile === "all") {
      router.push("/todo");
    }
  }, [role, router, profile, isLoaded]);

  const [selectedUser, setSelectedUser] = useState<string | undefined>(
    undefined
  );

  const handleTransferTask = async (todoId: string) => {
    if (!selectedUser) {
      toast.error("Selecione um funcionário para transferir a tarefa.");
      return;
    }
    console.log("selectedUser", selectedUser);

    const userPhone = users?.find((u) => u.id === selectedUser)?.phone;
    if (!userPhone) {
      toast.error("Funcionário não encontrado.");
      return;
    }

    await transferTask(todoId, selectedUser);
    // console.log("selectedUser", selectedUser);
    //toast.success("Tarefa transferida com sucesso!");
    sendWhatsAppNotification(userPhone);

    toast.success("Tarefa transferida com sucesso!");

    setTimeout(() => {
      location.reload();
    }, 2000);
  };
  
  const handleReOpenTask = async (todo: Todo) => {
    console.log("todo: ", todo);
    await reOpenTask(todo.id);

    if (todo.worker) {
      const userPhone = users?.find((u) => u.id === todo.worker)?.phone;
      if (userPhone) {
        sendWhatsAppNotification(userPhone);
      }
    }

    toast.success("Tarefa reaberta com sucesso!");

    setTimeout(() => {
      location.reload();
    }, 2000);
  };

  const handleFinishTask = async (todoId: string) => {
    await finishTask(todoId)
      .then((finishRes) => {
        if (!finishRes) {
          toast.error("Você não pode finalizar essa tarefa.");
          return;
        }
        toast.success("Tarefa finalizada com sucesso!");
        setTimeout(() => {
          location.reload();
        }, 2000);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Erro ao finalizar a tarefa.");
      });
  };

  const sendWhatsAppNotification = async (phone: string) => {
    const evoResponse = await fetch(
      `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/api/clerkusers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: phone }),
        cache: "no-store",
      }
    );
    if (evoResponse.ok) {
      toast.success("Notificação enviada com sucesso!");
    } else {
      toast.error("Falha ao enviar notificação.");
    }
  };

  return (
    <Card className="mt-4 w-full sm:w-4/5 p-4">
      <CardTitle>
        {profile === "all" && "Todas as Tarefas" }
        {profile === "user" && "Minhas Tarefas"}
        {profile === "closed" && "Tarefas Fechadas"}
      </CardTitle>
      <CardContent className="flex flex-col gap-4 mt-8">
        {todos?.map((todo) => (
          <div
            key={todo.id}
            className="flex flex-col sm:flex-row sm:justify-between border-b-2 p-2 hover:bg-gray-300 rounded-md gap-3"
          >
            <span className="break-words">{todo.description} </span>
            {profile === "all" && (
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <span className="text-sm">{users?.find((u) => u.id === todo.worker)?.email}</span>
                {role === "admin" && (
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="rounded-full w-full sm:w-auto" variant="outline">
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
                        <Button className="w-full sm:w-auto">Finalizar</Button>
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
            )}

            {profile === "closed" && (
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <span className="text-sm">{users?.find((u) => u.id === todo.worker)?.email}</span>
                {role === "admin" && (
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="rounded-full w-full sm:w-auto" variant="outline">
                          Reabrir e Transferir Tarefa
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reabrir e Transferir Tarefa</DialogTitle>
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
                        <Button className="w-full sm:w-auto">Reabrir</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          Deseja realmente reabrir a tarefa?
                        </AlertDialogHeader>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleReOpenTask(todo)}
                        >
                          Reabrir
                        </AlertDialogAction>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            )}

            {profile === "user" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="w-full sm:w-auto">Finalizar</Button>
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
