import type { Metadata } from "next";
import { Suspense } from "react";
import { getSiteContent } from "@/app/lib/content";
import Checkout from "./Checkout";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  return {
    title: `Checkout — ${site.product.title}`,
    description: `Complete your order for ${site.product.title} by ${site.product.author}.`,
  };
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <Checkout />
    </Suspense>
  );
}
