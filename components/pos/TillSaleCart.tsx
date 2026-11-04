"use client";

import { useEffect, useState } from "react";
import { Plus, Minus, Printer, ShoppingCart, PenLine, X } from "lucide-react";
import { getSession } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { attemptOrQueue } from "@/lib/pos-queue";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import { Input } from "@/components/ui/Input";

interface Product {
  id: string;
  name: string;
  category: string;
  priceLkr: string;
  stockCount: number | null;
  imageUrl: string | null;
  active: boolean;
}

interface CartLine {
  product: Product;
  quantity: number;
}

// A one-off item typed in at the till, not from the catalog (e.g. a repair
// fee, a lost-paddle charge). Kept separate from `cart`/`products` since it
// has no real catalog id - the server resolves it against a single
// internal "Custom Item" row (see app/api/pos/sales/route.ts).
interface CustomLine {
  id: string;
  name: string;
  priceLkr: string;
  quantity: number;
}

interface ReceiptLine {
  name: string;
  quantity: number;
  priceLkr: number;
}

interface CompletedSale {
  id: string;
  receiptLines: ReceiptLine[];
  total: number;
  paymentMethod: "cash" | "card";
  queued: boolean;
}

export default function TillSaleCart() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [customLines, setCustomLines] = useState<CustomLine[]>([]);
  const [customFormOpen, setCustomFormOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
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

  const catalogTotal = lines.reduce((sum, l) => sum + Number(l.product.priceLkr) * l.quantity, 0);
  const customTotal = customLines.reduce((sum, c) => sum + Number(c.priceLkr) * c.quantity, 0);
  const total = catalogTotal + customTotal;
  const isEmpty = lines.length === 0 && customLines.length === 0;

  const addToCart = (productId: string) => setCart((c) => ({ ...c, [productId]: (c[productId] ?? 0) + 1 }));
  const removeFromCart = (productId: string) =>
    setCart((c) => ({ ...c, [productId]: Math.max(0, (c[productId] ?? 0) - 1) }));

  const adjustCustomQty = (id: string, delta: number) =>
    setCustomLines((prev) =>
      prev.map((c) => (c.id === id ? { ...c, quantity: c.quantity + delta } : c)).filter((c) => c.quantity > 0)
    );

  const addCustomLine = () => {
    const price = Number(customPrice);
    if (!customName.trim() || !price || price <= 0) return;
    setCustomLines((prev) => [...prev, { id: crypto.randomUUID(), name: customName.trim(), priceLkr: customPrice, quantity: 1 }]);
    setCustomName("");
    setCustomPrice("");
    setCustomFormOpen(false);
  };

  const checkout = async () => {
    if (isEmpty) return;
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
        items: [
          ...lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
          ...customLines.map((c) => ({ custom: { name: c.name, priceLkr: Number(c.priceLkr) }, quantity: c.quantity })),
        ],
      },
    });

    setCheckingOut(false);

    if (result.status === "error") {
      setError(result.message);
      return;
    }

    const receiptLines: ReceiptLine[] = [
      ...lines.map((l) => ({ name: l.product.name, quantity: l.quantity, priceLkr: Number(l.product.priceLkr) })),
      ...customLines.map((c) => ({ name: c.name, quantity: c.quantity, priceLkr: Number(c.priceLkr) })),
    ];
    setCompletedSale({ id: saleId, receiptLines, total, paymentMethod, queued: result.status === "queued" });
    setCart({});
    setCustomLines([]);
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
        {/* Custom item - always available, not tied to the catalog, for a
            one-off charge (repair fee, lost item, anything not stocked). */}
        <Card poster padding="md" className="border-dashed">
          {!customFormOpen ? (
            <button
              onClick={() => setCustomFormOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2 font-bold text-admin-text rounded-lg hover:bg-admin-bg transition-colors"
            >
              <PenLine className="w-4 h-4" aria-hidden="true" />
              Custom Item
            </button>
          ) : (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <Input
                  label="Item name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Racquet repair"
                  autoFocus
                />
                <Input
                  label="Price (LKR)"
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-2">
                <Button tone="admin" variant="lime" onClick={addCustomLine} disabled={!customName.trim() || !Number(customPrice)}>
                  Add to Cart
                </Button>
                <Button
                  tone="admin"
                  variant="secondary"
                  onClick={() => {
                    setCustomFormOpen(false);
                    setCustomName("");
                    setCustomPrice("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>

        {Object.keys(byCategory).length === 0 && (
          <p className="text-admin-text-muted">No products yet - add some in Products.</p>
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
                  {p.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element -- data: URLs aren't optimizable by next/image
                    <img src={p.imageUrl} alt="" className="w-full aspect-square rounded object-cover mb-2 border border-admin-border" />
                  )}
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
        {isEmpty ? (
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
            {customLines.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex-1 text-admin-text">
                  {c.name}
                  <span className="ml-1.5 text-xs text-admin-text-muted">(Custom)</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => adjustCustomQty(c.id, -1)} className="p-2 rounded-lg border-2 border-ink hover:bg-admin-bg" aria-label={`Remove one ${c.name}`}>
                    <Minus className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <span className="w-6 text-center font-bold">{c.quantity}</span>
                  <button onClick={() => adjustCustomQty(c.id, 1)} className="p-2 rounded-lg border-2 border-ink hover:bg-admin-bg" aria-label={`Add one ${c.name}`}>
                    <Plus className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button onClick={() => setCustomLines((prev) => prev.filter((x) => x.id !== c.id))} className="p-2 text-danger-700 dark:text-danger-300" aria-label={`Remove ${c.name}`}>
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
                <span className="w-20 text-right font-mono text-admin-text">
                  {formatCurrency(Number(c.priceLkr) * c.quantity)}
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

        <Button tone="admin" variant="lime" fullWidth size="lg" onClick={checkout} loading={checkingOut} disabled={isEmpty}>
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
          {sale.receiptLines.map((l, i) => (
            <div key={i} className="flex justify-between">
              <span>
                {l.quantity} × {l.name}
              </span>
              <span>{formatCurrency(l.priceLkr * l.quantity)}</span>
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
