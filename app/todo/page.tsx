import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/app/_components/ui/card";
import NavBar from "../_components/navbar";

const TodoPage = () => {
  return (
    <>
      <NavBar />
      <Card className="mt-4">
        <CardTitle>Todo Page</CardTitle>
        <CardDescription>This is a todo page</CardDescription>
        <CardContent>
          <p>Todo page content</p>
        </CardContent>
      </Card>
    </>
  );
};

export default TodoPage;
