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

  console.log(data);
  return NextResponse.json(data);
}
