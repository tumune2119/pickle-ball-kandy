"use client";

import { useEffect, useState } from "react";
import { Plus, Minus, Printer, ShoppingCart } from "lucide-react";
import { getSession } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { attemptOrQueue } from "@/lib/pos-queue";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";

interface Product {
  id: string;
  name: string;
  category: string;
  priceLkr: string;
  stockCount: number | null;
  active: boolean;
}

interface CartLine {
  product: Product;
  quantity: number;
}

interface CompletedSale {
  id: string;
  lines: CartLine[];
  total: number;
  paymentMethod: "cash" | "card";
  queued: boolean;
}

export default function TillSaleCart() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState("");
  const [completedSale, setCompletedSale] = useState<CompletedSale | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const session = await getSession();
      if (!session) return;
      const res = await fetch("/api/pos/products?activeOnly=true", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (cancelled) return;
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products ?? []);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const lines: CartLine[] = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([productId, quantity]) => ({ product: products.find((p) => p.id === productId)!, quantity }))
    .filter((l) => l.product);

  const total = lines.reduce((sum, l) => sum + Number(l.product.priceLkr) * l.quantity, 0);

  const addToCart = (productId: string) => setCart((c) => ({ ...c, [productId]: (c[productId] ?? 0) + 1 }));
  const removeFromCart = (productId: string) =>
    setCart((c) => ({ ...c, [productId]: Math.max(0, (c[productId] ?? 0) - 1) }));

  const checkout = async () => {
    if (lines.length === 0) return;
    setCheckingOut(true);
    setError("");

    const session = await getSession();
    if (!session) {
      setError("Session expired - please log in again.");
      setCheckingOut(false);
      return;
    }

    const saleId = crypto.randomUUID();
    const result = await attemptOrQueue({
      id: saleId,
      kind: "sale",
      endpoint: "/api/pos/sales",
      authHeader: `Bearer ${session.access_token}`,
      payload: {
        id: saleId,
        paymentMethod,
        items: lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
      },
    });

    setCheckingOut(false);

    if (result.status === "error") {
      setError(result.message);
      return;
    }

    setCompletedSale({ id: saleId, lines, total, paymentMethod, queued: result.status === "queued" });
    setCart({});
  };

  if (completedSale) {
    return <SaleReceipt sale={completedSale} onNewSale={() => setCompletedSale(null)} />;
  }

  if (loading) return <Skeleton className="h-64 w-full" />;

  const byCategory = products.reduce<Record<string, Product[]>>((acc, p) => {
    (acc[p.category] ??= []).push(p);
    return acc;
  }, {});

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {Object.keys(byCategory).length === 0 && (
          <p className="text-admin-text-muted">No products yet - add some in Settings → Point of Sale.</p>
        )}
        {Object.entries(byCategory).map(([category, items]) => (
          <div key={category}>
            <h3 className="font-display uppercase text-admin-text mb-2">{category}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {items.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p.id)}
                  className="text-left p-4 rounded-lg border-2 border-ink bg-admin-surface hover:bg-admin-bg active:translate-x-[1px] active:translate-y-[1px] transition-[transform,background-color]"
                >
                  <div className="font-bold text-admin-text">{p.name}</div>
                  <div className="text-admin-action font-bold font-mono text-lg">{formatCurrency(Number(p.priceLkr))}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Card poster padding="md" className="h-fit sticky top-4">
        <h3 className="font-display uppercase text-admin-text mb-3 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" aria-hidden="true" />
          Cart
        </h3>
        {lines.length === 0 ? (
          <p className="text-sm text-admin-text-muted">Tap a product to add it.</p>
        ) : (
          <div className="space-y-2 mb-4">
            {lines.map((l) => (
              <div key={l.product.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex-1 text-admin-text">{l.product.name}</span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => removeFromCart(l.product.id)} className="p-2 rounded-lg border-2 border-ink hover:bg-admin-bg" aria-label={`Remove one ${l.product.name}`}>
                    <Minus className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <span className="w-6 text-center font-bold">{l.quantity}</span>
                  <button onClick={() => addToCart(l.product.id)} className="p-2 rounded-lg border-2 border-ink hover:bg-admin-bg" aria-label={`Add one ${l.product.name}`}>
                    <Plus className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
                <span className="w-20 text-right font-mono text-admin-text">
                  {formatCurrency(Number(l.product.priceLkr) * l.quantity)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between font-bold text-lg text-admin-text border-t border-admin-border pt-3 mb-4">
          <span>Total</span>
          <span className="font-mono">{formatCurrency(total)}</span>
        </div>

        <div className="flex gap-2 mb-4">
          {(["cash", "card"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setPaymentMethod(m)}
              className={`flex-1 py-3 rounded-lg border-2 border-ink text-base font-bold capitalize transition-[transform,box-shadow,background-color,color] ${
                paymentMethod === m
                  ? "bg-admin-action text-admin-text-on-action shadow-[2px_2px_0_var(--color-ink)] dark:shadow-[2px_2px_0_var(--color-concrete-100)]"
                  : "bg-admin-surface text-admin-text-muted"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-danger-700 dark:text-danger-300 mb-3">{error}</p>}

        <Button tone="admin" variant="lime" fullWidth size="lg" onClick={checkout} loading={checkingOut} disabled={lines.length === 0}>
          Checkout
        </Button>
      </Card>
    </div>
  );
}

function SaleReceipt({ sale, onNewSale }: { sale: CompletedSale; onNewSale: () => void }) {
  return (
    <div>
      {sale.queued && (
        <p className="text-center text-sm text-warning-800 dark:text-warning-300 mb-3 print:hidden">
          No connection right now - this sale is queued and will sync automatically.
        </p>
      )}
      <div className="max-w-sm mx-auto bg-white text-black border-2 border-ink print:border-0 rounded-lg p-6 font-mono">
        <div className="text-center mb-4">
          <div className="font-bold text-lg uppercase">Pickle Rush</div>
          <div className="text-xs text-concrete-600">Sale Receipt</div>
        </div>
        <div className="border-t border-dashed border-concrete-400 my-3" />
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-concrete-600">
            <span>Ref</span>
            <span>{sale.id.slice(0, 8).toUpperCase()}</span>
          </div>
          {sale.lines.map((l) => (
            <div key={l.product.id} className="flex justify-between">
              <span>
                {l.quantity} × {l.product.name}
              </span>
              <span>{formatCurrency(Number(l.product.priceLkr) * l.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-dashed border-concrete-400 my-3" />
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>{formatCurrency(sale.total)}</span>
        </div>
        <div className="flex justify-between text-sm text-concrete-600">
          <span>Payment</span>
          <span className="uppercase">{sale.paymentMethod}</span>
        </div>
      </div>
      <div className="flex justify-center gap-3 mt-4 print:hidden">
        <Button tone="admin" variant="secondary" onClick={() => window.print()}>
          <Printer className="w-4 h-4" aria-hidden="true" />
          Print
        </Button>
        <Button tone="admin" onClick={onNewSale}>
          New Sale
        </Button>
      </div>
    </div>
  );
}
