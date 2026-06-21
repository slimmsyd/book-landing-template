import type { Metadata } from "next";
import { Suspense } from "react";
import site from "@/site.config";
import Checkout from "./Checkout";

export const metadata: Metadata = {
  title: `Checkout — ${site.product.title}`,
  description: `Complete your order for ${site.product.title} by ${site.product.author}.`,
};

export default function CheckoutPage() {
  return (
    <Suspense>
      <Checkout />
    </Suspense>
  );
}
