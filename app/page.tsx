import Image from "next/image";
import { Button } from "./_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "./_components/ui/card";

const Login = () => {
  return (
    <>
      <div className="flex justify-center items-center h-screen">
        <Card className="w-96 h-auto">
          <CardTitle className="flex justify-center mt-4">Login</CardTitle>
          <CardDescription className="flex justify-center mt-2">
            Controle de Tarefas
          </CardDescription>
          <CardContent className="flex flex-col gap-4 h-full">
            <div className="flex justify-center">
              <Image
                src={"/logo.jpg"}
                width={200}
                height={200}
                alt="suxberger"
              />
            </div>
            <div className="flex flex-col mt-auto mb-8">
              <Button>Entrar</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Login;
