"use client";

import { useEffect, useState } from "react";
import { Package, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { getSession } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";

interface Product {
  id: string;
  name: string;
  category: string;
  priceLkr: string;
  stockCount: number | null;
  active: boolean;
}

const CATEGORIES = ["rental", "retail", "membership", "other"];
const EMPTY_NEW = { name: "", category: "retail", priceLkr: "", stockCount: "" };

async function authHeaders() {
  const session = await getSession();
  return session ? { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" } : null;
}

// Lives in Settings -> Point of Sale (admin-only page). Manages the catalog
// the till (/pos) sells from - adding, editing, deactivating, deleting.
export default function ProductCatalogSettings() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Product>>({});
  const [newProduct, setNewProduct] = useState(EMPTY_NEW);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const headers = await authHeaders();
      if (!headers) return;
      const res = await fetch("/api/pos/products", { headers });
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

  const handleAdd = async () => {
    if (!newProduct.name || !newProduct.priceLkr) return;
    setAdding(true);
    setError("");
    const headers = await authHeaders();
    if (!headers) return;
    const res = await fetch("/api/pos/products", {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: newProduct.name,
        category: newProduct.category,
        priceLkr: newProduct.priceLkr,
        stockCount: newProduct.stockCount || null,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setProducts((prev) => [...prev, data.product]);
      setNewProduct(EMPTY_NEW);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to add product");
    }
    setAdding(false);
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setEditDraft({ name: p.name, category: p.category, priceLkr: p.priceLkr, stockCount: p.stockCount });
  };

  const saveEdit = async (id: string) => {
    const headers = await authHeaders();
    if (!headers) return;
    const res = await fetch("/api/pos/products", {
      method: "PATCH",
      headers,
      body: JSON.stringify({ id, ...editDraft }),
    });
    if (res.ok) {
      const data = await res.json();
      setProducts((prev) => prev.map((p) => (p.id === id ? data.product : p)));
      setEditingId(null);
    }
  };

  const toggleActive = async (p: Product) => {
    const headers = await authHeaders();
    if (!headers) return;
    const res = await fetch("/api/pos/products", {
      method: "PATCH",
      headers,
      body: JSON.stringify({ id: p.id, active: !p.active }),
    });
    if (res.ok) {
      const data = await res.json();
      setProducts((prev) => prev.map((x) => (x.id === p.id ? data.product : x)));
    }
  };

  const handleDelete = async (id: string) => {
    setError("");
    const headers = await authHeaders();
    if (!headers) return;
    const res = await fetch(`/api/pos/products?id=${id}`, { method: "DELETE", headers });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to delete product");
    }
  };

  return (
    <div>
      <h3 className="text-lg font-display uppercase text-text-primary mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-admin-action" aria-hidden="true" />
        Point of Sale — Products
      </h3>

      {loading ? (
        <p className="text-sm text-admin-text-muted">Loading…</p>
      ) : (
        <div className="space-y-2 mb-4">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg border border-admin-border">
              {editingId === p.id ? (
                <>
                  <Input
                    value={editDraft.name ?? ""}
                    onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                    wrapperClassName="flex-1"
                  />
                  <Select
                    value={editDraft.category ?? "retail"}
                    onChange={(e) => setEditDraft((d) => ({ ...d, category: e.target.value }))}
                    wrapperClassName="w-32"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                  <Input
                    type="number"
                    value={editDraft.priceLkr ?? ""}
                    onChange={(e) => setEditDraft((d) => ({ ...d, priceLkr: e.target.value }))}
                    wrapperClassName="w-28"
                  />
                  <button onClick={() => saveEdit(p.id)} className="p-2 text-success-700 dark:text-success-400" aria-label="Save">
                    <Check className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-2 text-admin-text-muted" aria-label="Cancel">
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <span className={p.active ? "text-admin-text" : "text-admin-text-muted line-through"}>{p.name}</span>
                    <span className="ml-2 text-xs text-admin-text-muted capitalize">{p.category}</span>
                  </div>
                  <span className="font-mono text-admin-text w-24 text-right">{formatCurrency(Number(p.priceLkr))}</span>
                  <button onClick={() => toggleActive(p)} className="text-xs font-medium px-2 py-1 rounded border border-admin-border text-admin-text-muted">
                    {p.active ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => startEdit(p)} className="p-2 text-admin-text-muted hover:text-admin-action" aria-label={`Edit ${p.name}`}>
                    <Pencil className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 text-admin-text-muted hover:text-danger-700" aria-label={`Delete ${p.name}`}>
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </>
              )}
            </div>
          ))}
          {products.length === 0 && <p className="text-sm text-admin-text-muted">No products yet - add one below.</p>}
        </div>
      )}

      {error && <p className="text-sm text-danger-700 dark:text-danger-300 mb-3">{error}</p>}

      <div className="flex flex-wrap items-end gap-2 pt-3 border-t border-admin-border">
        <Input
          label="New product name"
          value={newProduct.name}
          onChange={(e) => setNewProduct((n) => ({ ...n, name: e.target.value }))}
          wrapperClassName="flex-1 min-w-[160px]"
        />
        <Select
          label="Category"
          value={newProduct.category}
          onChange={(e) => setNewProduct((n) => ({ ...n, category: e.target.value }))}
          wrapperClassName="w-32"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Input
          label="Price (LKR)"
          type="number"
          value={newProduct.priceLkr}
          onChange={(e) => setNewProduct((n) => ({ ...n, priceLkr: e.target.value }))}
          wrapperClassName="w-28"
        />
        <Input
          label="Stock (optional)"
          type="number"
          value={newProduct.stockCount}
          onChange={(e) => setNewProduct((n) => ({ ...n, stockCount: e.target.value }))}
          wrapperClassName="w-28"
        />
        <Button tone="admin" onClick={handleAdd} loading={adding} disabled={!newProduct.name || !newProduct.priceLkr}>
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add
        </Button>
      </div>
    </div>
  );
}
