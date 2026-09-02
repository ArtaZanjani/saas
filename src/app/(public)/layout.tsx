import Auth from "@/components/organisms/Auth";
import { verifyUser } from "@/actions/auth";
import { Suspense } from "react";
import { redirect, RedirectType } from "next/navigation";

const Layout = async ({ children }: LayoutProps<"/">) => {
  const userData = await verifyUser();

  if (!!userData?.user) redirect("/dashboard", RedirectType.replace);

  return (
    <>
      {children}

      <Suspense>
        <Auth />
      </Suspense>
    </>
  );
};

export default Layout;
