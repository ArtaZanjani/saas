import { logout } from "@/actions/auth";
import { redirect, RedirectType } from "next/navigation";
import type { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  await logout();
  const login = req.nextUrl.searchParams.get("login");

  redirect(login === "true" ? "/?login=true" : "/", RedirectType.replace);
};
