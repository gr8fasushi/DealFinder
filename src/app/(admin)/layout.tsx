import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { checkAdminAccess } from "@/lib/auth-helpers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check admin access using Clerk API
  const access = await checkAdminAccess();
  if (!access.authorized) {
    redirect("/sign-in");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminNav />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}
