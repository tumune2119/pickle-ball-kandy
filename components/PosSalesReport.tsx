"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { getSession } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";

interface SaleItem {
  productName: string;
  quantity: number;
  lineTotalLkr: string;
}

interface Sale {
  id: string;
  totalLkr: string;
  paymentMethod: string;
  items: SaleItem[];
}

// Lives on the Reports page (admin-only) - POS revenue alongside the
// existing booking-revenue report, per the proposal's "no manual
// reconciliation" goal. Re-fetches whenever the page's own date range
// changes (same startDate/endDate the booking reports use).
export default function PosSalesReport({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const session = await getSession();
      if (!session) {
        if (!cancelled) setLoading(false);
        return;
      }
      const res = await fetch(`/api/pos/sales?startDate=${startDate}&endDate=${endDate}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (cancelled) return;
      if (res.ok) {
        const data = await res.json();
        setSales(data.sales ?? []);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  const total = sales.reduce((sum, s) => sum + Number(s.totalLkr), 0);
  const byProduct = new Map<string, number>();
  for (const sale of sales) {
    for (const item of sale.items) {
      byProduct.set(item.productName, (byProduct.get(item.productName) ?? 0) + item.quantity);
    }
  }
  const bestSellers = [...byProduct.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <Card padding="md">
      <h3 className="font-display uppercase text-lg mb-4 text-text-primary flex items-center gap-2">
        <ShoppingCart className="w-5 h-5 text-admin-action" aria-hidden="true" />
        POS Sales
      </h3>
      {loading ? (
        <Skeleton className="h-24 w-full" />
      ) : (
        <RevealGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RevealItem>
            <Card tint="success" padding="md">
              <p className="font-semibold text-sm text-success-700 dark:text-success-400">Total POS Revenue</p>
              <p className="text-3xl font-bold mt-2 text-success-700 dark:text-success-400">{formatCurrency(total)}</p>
              <p className="text-xs mt-2 text-success-700 dark:text-success-400">{sales.length} sale(s) in range</p>
            </Card>
          </RevealItem>
          <RevealItem>
            <Card tint="admin" padding="md">
              <p className="font-semibold text-sm text-admin-action">Best Sellers</p>
              {bestSellers.length === 0 ? (
                <p className="text-sm text-admin-text-muted mt-2">No sales yet in this range.</p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm text-admin-text">
                  {bestSellers.map(([name, qty]) => (
                    <li key={name} className="flex justify-between">
                      <span>{name}</span>
                      <span className="font-mono">{qty}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </RevealItem>
        </RevealGroup>
      )}
    </Card>
  );
}
