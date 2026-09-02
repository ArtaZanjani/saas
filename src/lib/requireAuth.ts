import { verifyUser } from "@/actions/auth";
import { RedirectType, redirect } from "next/navigation";
import type { UserRole } from "@/generated/prisma/enums";

const requireAuth = async ({
  role,
  redirectOnForbidden = false,
}: {
  role?: UserRole;
  redirectOnForbidden?: boolean;
} = {}) => {
  const auth = await verifyUser();

  if (!auth) {
    if (redirectOnForbidden) redirect("/?login=true", RedirectType.replace);

    throw { message: "لطفاً ابتدا وارد حساب کاربری شوید", status: 401 };
  }

  if (role && auth.user.role !== role) {
    if (redirectOnForbidden) redirect(auth.user.role === "USER" ? "/dashboard" : "/dashboard/admin", RedirectType.replace);

    throw { message: "شما دسترسی به این عملیات را ندارید", status: 403 };
  }

  return auth;
};

export default requireAuth;
