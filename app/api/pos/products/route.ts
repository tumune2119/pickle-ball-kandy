import { db } from "@/lib/db/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireAdminOnly } from "@/lib/server-auth";

// GET /api/pos/products - Full product catalog (staff needs this to sell
// from the till; only admin can change it, below).
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") === "true";

    const allProducts = activeOnly
      ? await db.select().from(products).where(eq(products.active, true))
      : await db.select().from(products);

    return NextResponse.json({ products: allProducts });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST /api/pos/products - Admin-only: add a new product to the catalog.
export async function POST(request: NextRequest) {
  const auth = await requireAdminOnly(request);
  if (auth.response) return auth.response;

  try {
    const body = await request.json();
    const { name, category, priceLkr, stockCount } = body;

    if (!name || !category || priceLkr === undefined || priceLkr === null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const inserted = await db
      .insert(products)
      .values({
        name,
        category,
        priceLkr: String(priceLkr),
        stockCount: stockCount === undefined || stockCount === null ? null : Number(stockCount),
      })
      .returning();

    return NextResponse.json({ product: inserted[0] }, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

// PATCH /api/pos/products - Admin-only: edit or deactivate an existing
// product. Body: { id, ...fields to change }.
export async function PATCH(request: NextRequest) {
  const auth = await requireAdminOnly(request);
  if (auth.response) return auth.response;

  try {
    const body = await request.json();
    const { id, name, category, priceLkr, stockCount, active } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }

    const updates: Partial<typeof products.$inferInsert> = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;
    if (priceLkr !== undefined) updates.priceLkr = String(priceLkr);
    if (stockCount !== undefined) updates.stockCount = stockCount === null ? null : Number(stockCount);
    if (active !== undefined) updates.active = Boolean(active);

    const updated = await db.update(products).set(updates).where(eq(products.id, id)).returning();

    if (!updated.length) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product: updated[0] });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE /api/pos/products?id=... - Admin-only. Products referenced by past
// sale items can't be hard-deleted (pos_sale_items.product_id references
// restrict-on-delete) - deactivate via PATCH { active: false } instead for
// anything that's ever been sold.
export async function DELETE(request: NextRequest) {
  const auth = await requireAdminOnly(request);
  if (auth.response) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }

    const deleted = await db.delete(products).where(eq(products.id, id)).returning();
    if (!deleted.length) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("foreign key") || message.includes("violates")) {
      return NextResponse.json(
        { error: "This product has past sales recorded - deactivate it instead of deleting." },
        { status: 409 }
      );
    }
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
