import { getSubscribers } from "@/app/lib/subscribers";

export const dynamic = "force-dynamic";

export default async function AdminSubscribersPage() {
  const subs = await getSubscribers();
  return (
    <div className="flex flex-col gap-[clamp(20px,4vw,32px)]">
      <div className="flex flex-col gap-[6px]">
        <span className="font-display text-[12px] uppercase tracking-[0.34em] text-gold">Subscribers</span>
        <h1 className="m-0 font-display text-[clamp(26px,3.4vw,40px)] font-normal leading-[1.05] tracking-[-0.02em]">
          {subs.length} {subs.length === 1 ? "subscriber" : "subscribers"}
        </h1>
      </div>
      {subs.length === 0 ? (
        <p className="rounded-[10px] bg-panel p-[28px] text-[15px] text-ink-soft">
          No subscribers yet. Newsletter / free-chapter signups will appear here.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-[10px] border border-ink/10">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="bg-panel text-left font-display text-[11px] uppercase tracking-[0.12em] text-muted">
                <th className="px-[14px] py-[12px] font-medium">Email</th>
                <th className="px-[14px] py-[12px] font-medium">Source</th>
                <th className="px-[14px] py-[12px] font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-t border-ink/10">
                  <td className="px-[14px] py-[12px] font-medium text-ink">{s.email}</td>
                  <td className="px-[14px] py-[12px] text-ink-soft">{s.source}</td>
                  <td className="whitespace-nowrap px-[14px] py-[12px] text-ink-soft">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
