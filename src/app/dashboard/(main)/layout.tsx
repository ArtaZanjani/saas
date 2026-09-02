import Header from "@/components/organisms/Header";
import NewOrder from "@/components/organisms/NewOrder";
import SideBar from "@/components/organisms/SideBar";
import requireAuth from "@/lib/requireAuth";

const Layout = async ({ children }: LayoutProps<"/dashboard">) => {
  const auth = await requireAuth({ redirectOnForbidden: true });

  const products = auth.user.products.map((e) => ({
    productId: e.id,
    productName: e.productName,
  }));
  return (
    <>
      <Header />
      <NewOrder products={[...products]} />

      <div className="w-full paddingBody py-6 sm:py-8">
        <div className="grid min-h-[calc(100vh-80px)] xl:grid-cols-[220px_1fr] gap-6 xl:gap-8">
          <SideBar role={auth.user.role} />

          <main className="min-w-0 flex flex-col gap-y-5">{children}</main>
        </div>
      </div>
    </>
  );
};

export default Layout;
