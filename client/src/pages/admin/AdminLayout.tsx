import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout() {
  const { user, isLoaded } = useUser();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user || user.publicMetadata?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const links = [
    { to: "/admin", label: "Overview" },
    { to: "/admin/posts", label: "Manage Posts" },
    { to: "/admin/create", label: "Create Post" },
    { to: "/admin/ai", label: "AI Assistant" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <nav className="mb-8 flex gap-2 overflow-x-auto pb-2">
        {links.map((link) => (
          <Link key={link.to} to={link.to}>
            <Button
              variant={location.pathname === link.to ? "default" : "outline"}
              size="sm"
            >
              {link.label}
            </Button>
          </Link>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
