"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminRole } from "@/lib/useAdminRole";
import Card from "@/components/ui/Card";
import ProductCatalogSettings from "@/components/ProductCatalogSettings";

// Split out of Settings into its own tab - the catalog is managed often
// enough (new items, price changes) that it doesn't belong buried under
// court/pricing config. Still admin-only, same as Settings and Reports.
export default function AdminProductsPage() {
  const router = useRouter();
  const role = useAdminRole();
  useEffect(() => {
    if (role === "staff") router.replace("/admin/dashboard");
  }, [role, router]);

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-display uppercase mb-6 text-text-primary skew-display">Products</h2>
      <Card padding="md">
        <ProductCatalogSettings />
      </Card>
    </div>
  );
}
