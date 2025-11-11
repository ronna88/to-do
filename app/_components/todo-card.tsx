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
import { useRouter, useSearchParams } from "next/navigation";
import { reOpenTask } from "../_actions/reopen-task";
import { Input } from "./ui/input";
import Pagination from "../_components/_pagination/page";

interface ToDoCardProps {
  todos: Todo[];
  profile: "user" | "all" | "closed";
  users?: { email: string; id: string; phone?: string }[]; 
  currentPage: number;
  totalPages: number;
}

const ToDoCard = ({ todos, profile, users, currentPage, totalPages }: ToDoCardProps) => {
  const { user, isLoaded } = useUser();
  const role = user?.publicMetadata.role;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filteredTodos, setFilteredTodos] = useState<Todo[]>(todos);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isReopening, setIsReopening] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if (isLoaded && role !== "admin" && profile === "all") {
      router.push("/todo");
    }
  }, [role, router, profile, isLoaded]);

  useEffect(() => {
    setFilteredTodos(todos);
  }, [todos]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      
      const params = new URLSearchParams(searchParams.toString());
      
      if (searchQuery === "") {
        params.delete("search");
      } else {
        params.set("search", searchQuery);
        params.set("page", "1"); // Volta para página 1 ao buscar
      }
      
      router.push(`?${params.toString()}`);
    }, 500); // Aguarda 500ms após parar de digitar

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchQuery, router, searchParams]);
  

  const handleTransferTask = async (todoId: string) => {
    if (isTransferring) return; // Evita múltiplos cliques
    
    if (!selectedUser) {
      toast.error("Selecione um funcionário para transferir a tarefa.");
      return;
    }
    
    setIsTransferring(true);
    toast.loading("Transferindo tarefa...");
    
    console.log("selectedUser", selectedUser);

    const userPhone = users?.find((u) => u.id === selectedUser)?.phone;
    if (!userPhone) {
      toast.dismiss();
      toast.error("Funcionário não encontrado.");
      setIsTransferring(false);
      return;
    }

    try {
      await transferTask(todoId, selectedUser);
      sendWhatsAppNotification(userPhone);

      toast.dismiss();
      toast.success("Tarefa transferida com sucesso!");

      setTimeout(() => {
        location.reload();
      }, 2000);
    } catch (error) {
      toast.dismiss();
      toast.error("Erro ao transferir tarefa.");
      setIsTransferring(false);
    }
  };
  
  const handleReOpenTask = async (todo: Todo) => {
    if (isReopening) return; // Evita múltiplos cliques
    
    setIsReopening(true);
    toast.loading("Reabrindo tarefa...");
    
    try {
      await reOpenTask(todo.id);

      if (todo.worker) {
        const userPhone = users?.find((u) => u.id === todo.worker)?.phone;
        if (userPhone) {
          sendWhatsAppNotification(userPhone);
        }
      }

      toast.dismiss();
      toast.success("Tarefa reaberta com sucesso!");

      setTimeout(() => {
        location.reload();
      }, 2000);
    } catch (error) {
      toast.dismiss();
      toast.error("Erro ao reabrir tarefa.");
      setIsReopening(false);
    }
  };

  const handleFinishTask = async (todoId: string) => {
    if (isFinishing) return; // Evita múltiplos cliques
    
    setIsFinishing(true);
    toast.loading("Finalizando tarefa...");
    
    await finishTask(todoId)
      .then((finishRes) => {
        if (!finishRes) {
          toast.dismiss();
          toast.error("Você não pode finalizar essa tarefa.");
          setIsFinishing(false);
          return;
        }
        toast.dismiss();
        toast.success("Tarefa finalizada com sucesso!");
        setTimeout(() => {
          location.reload();
        }, 2000);
      })
      .catch((err) => {
        console.error(err);
        toast.dismiss();
        toast.error("Erro ao finalizar a tarefa.");
        setIsFinishing(false);
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

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  return (
    <Card className="mt-4 w-full sm:w-4/5 p-4">
      <CardTitle>
        {profile === "all" && "Todas as Tarefas" }
        {profile === "user" && "Minhas Tarefas"}
        {profile === "closed" && "Tarefas Fechadas"}
      </CardTitle>
      <CardContent className="flex flex-col gap-4 mt-8">
        {profile !== "user" && <div className="w-full lg:w-1/4">
          <Input 
            type="text" 
            placeholder="Buscar por funcionario..." 
            onChange={handleSearch} 
            value={searchQuery}
          />
        </div>
}
        
        
        {filteredTodos.length === 0 && searchQuery !== "" ? (<p className="text-center text-muted-foreground py-8">
            Nenhuma tarefa encontrada
          </p>):(filteredTodos?.map((todo) => (
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
                            disabled={isTransferring}
                          >
                            {isTransferring ? "Transferindo..." : "Transferir"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="w-full sm:w-auto" disabled={isFinishing}>Finalizar</Button>
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
                          disabled={isFinishing}
                        >
                          {isFinishing ? "Finalizando..." : "Finalizar"}
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
                            disabled={isTransferring}
                          >
                            {isTransferring ? "Transferindo..." : "Transferir"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="w-full sm:w-auto" disabled={isReopening}>Reabrir</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          Deseja realmente reabrir a tarefa?
                        </AlertDialogHeader>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleReOpenTask(todo)}
                          disabled={isReopening}
                        >
                          {isReopening ? "Reabrindo..." : "Reabrir"}
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
                  <Button className="w-full sm:w-auto" disabled={isFinishing}>Finalizar</Button>
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
                    disabled={isFinishing}
                  >
                    {isFinishing ? "Finalizando..." : "Finalizar"}
                  </AlertDialogAction>
                </AlertDialogContent>
              </AlertDialog>
            )}

          </div>
        )))}
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </CardContent>
    </Card>
  );
};

export default ToDoCard;
