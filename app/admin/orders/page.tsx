import { requireAdmin } from "@/lib/auth";
import { ShoppingCart, CreditCard, TrendingUp } from "lucide-react";

export const metadata = { title: "Orders & Payments" };
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdmin();

  // Placeholder for future Stripe integration
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-text mb-1">Orders & Payments</h1>
        <p className="text-text-secondary text-sm">
          Manage purchases, subscriptions, and payment processing.
        </p>
      </div>

      {/* Revenue Overview - Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-6 rounded-2xl border border-border bg-surface">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-gold" />
            <p className="text-xs text-text-muted uppercase tracking-wider">Total Revenue</p>
          </div>
          <p className="text-3xl font-bold text-text">$0</p>
          <p className="text-xs text-text-muted mt-1">All time</p>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-surface">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-4 h-4 text-gold" />
            <p className="text-xs text-text-muted uppercase tracking-wider">Orders</p>
          </div>
          <p className="text-3xl font-bold text-text">0</p>
          <p className="text-xs text-text-muted mt-1">Total orders</p>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-surface">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-gold" />
            <p className="text-xs text-text-muted uppercase tracking-wider">Subscriptions</p>
          </div>
          <p className="text-3xl font-bold text-text">0</p>
          <p className="text-xs text-text-muted mt-1">Active subscriptions</p>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-surface/50">
        <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-text mb-2">Payments Coming Soon</h3>
        <p className="text-sm text-text-secondary max-w-md mx-auto">
          Order management and Stripe integration will be added here. 
          This will include purchase history, subscriptions, refunds, and payment analytics.
        </p>
      </div>
    </div>
  );
}
