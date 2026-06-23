import Script from "next/script";

/**
 * Google Analytics (gtag) — opt-in via env.
 *
 * Set NEXT_PUBLIC_GA_MEASUREMENT_ID (e.g. "G-XXXXXXXXXX") to enable. With the
 * var unset, this renders nothing, so the template ships analytics-free by
 * default and turns on with one env var — no code change.
 */
export default function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  );
}
