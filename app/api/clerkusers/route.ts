"use server";
import { NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: Request) {
  const clerkApiKey = process.env.CLERK_SECRET_KEY;

  if (!clerkApiKey) {
    return new Response("Clerk API Key not found", { status: 500 });
  }

  const clerkUsers = await fetch("https://api.clerk.dev/v1/users", {
    headers: {
      Authorization: `Bearer ${clerkApiKey}`,
    },
  });

  if (!clerkUsers.ok) {
    return new Response("Failed to fetch users", { status: 500 });
  }

  const data = await clerkUsers.json();

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const evoApiKey = process.env.EVO_API_KEY;

  const body = await request.json();

  if (!evoApiKey) {
    return new Response("Evo API Key not found", { status: 500 });
  }

  const evoResponse = await fetch(`${process.env.NEXT_PUBLIC_EVO_URL}`, {
    method: "POST",
    headers: {
      apikey: `${evoApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      number: "55+" + body.phone,
      text: `${
        "Olá, você tem uma nova tarefa disponível. Acesse o aplicativo para mais informações. " +
        process.env.NEXT_PUBLIC_TASK_URL
      }`,
    }),
  });
  if (!evoResponse.ok) {
    return new Response("Falha ao enviar notificação do WhatsApp", {
      status: 500,
    });
  }

  return new Response("Notificação do WhatsApp enviada", { status: 200 });
}
