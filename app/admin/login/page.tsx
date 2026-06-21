import { getSiteContent } from "@/app/lib/content";
import LoginForm from "./LoginForm";

export default async function AdminLoginPage() {
  const site = await getSiteContent();
  return (
    <div className="flex min-h-screen items-center justify-center px-[24px]">
      <div className="w-full max-w-[380px] rounded-[10px] bg-panel p-[clamp(28px,4vw,40px)]">
        <span className="font-display text-[12px] uppercase tracking-[0.34em] text-gold">
          Admin
        </span>
        <h1 className="mb-[20px] mt-[8px] font-display text-[28px] font-normal leading-[1.05] tracking-[-0.02em]">
          {site.brand.siteName}
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}
