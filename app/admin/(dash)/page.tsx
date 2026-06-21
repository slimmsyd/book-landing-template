import Link from "next/link";
import { getContentUpdatedAt } from "@/app/lib/content";
import { getOrderCount } from "@/app/lib/orders";
import { getSubscriberCount } from "@/app/lib/subscribers";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [updatedAt, orders, subs] = await Promise.all([
    getContentUpdatedAt(),
    getOrderCount(),
    getSubscriberCount(),
  ]);

  const card =
    "flex flex-col gap-[10px] rounded-[10px] bg-panel p-[clamp(22px,3vw,30px)] transition-colors hover:bg-[#e9e2d3]";

  return (
    <div className="flex flex-col gap-[clamp(24px,4vw,36px)]">
      <div className="flex flex-col gap-[6px]">
        <span className="font-display text-[12px] uppercase tracking-[0.34em] text-gold">Dashboard</span>
        <h1 className="m-0 font-display text-[clamp(26px,3.4vw,40px)] font-normal leading-[1.05] tracking-[-0.02em]">
          Manage your site
        </h1>
      </div>
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-3">
        <Link href="/admin/content" className={card}>
          <span className="font-display text-[19px] tracking-[-0.01em]">Content</span>
          <span className="text-[13px] text-muted">
            {updatedAt ? `Edited ${updatedAt.toLocaleString()}` : "Using defaults"}
          </span>
          <span className="mt-[4px] text-[12px] text-gold">Edit everything →</span>
        </Link>
        <Link href="/admin/orders" className={card}>
          <span className="font-display text-[19px] tracking-[-0.01em]">Orders</span>
          <span className="text-[13px] text-muted">{orders} recorded</span>
          <span className="mt-[4px] text-[12px] text-gold">View orders →</span>
        </Link>
        <Link href="/admin/subscribers" className={card}>
          <span className="font-display text-[19px] tracking-[-0.01em]">Subscribers</span>
          <span className="text-[13px] text-muted">{subs} on the list</span>
          <span className="mt-[4px] text-[12px] text-gold">View subscribers →</span>
        </Link>
      </div>
    </div>
  );
}
