/**
 * site.config.ts — single source of truth for this landing template.
 *
 * Rebrand the whole site by editing this one file, then dropping your assets
 * into /public (see assets.md). Pricing lives here in CENTS so the server
 * (the Stripe PaymentIntent route) is the only pricing authority — the client
 * never decides what to charge.
 */

export type NavLink = { href: string; label: string };
export type SocialLink = { label: string; href: string };

export type SiteConfig = {
  brand: {
    /** Shown in copyright, aria labels, social card fallbacks. */
    siteName: string;
    /** Bare domain, e.g. "yourbook.com" — shown in footer + used for SEO URL. */
    domain: string;
    /** Logo image in /public (PNG/JPG/SVG). Rendered in the header + checkout. */
    logo: string;
    logoAlt: string;
    /** Stripe Elements appearance, mapped from the Tailwind tokens in globals.css. */
    stripeAppearance: {
      theme: "stripe" | "night" | "flat";
      variables: Record<string, string>;
    };
  };

  product: {
    title: string;
    author: string;
    /** e.g. "Paperback", "Hardcover", "Digital + Print". */
    format: string;
    /** Price per unit, in the smallest currency unit (cents). */
    priceCents: number;
    /** ISO currency code, lowercase for Stripe (e.g. "usd"). */
    currency: string;
    /** Flat shipping fee in cents (0 for digital products). */
    shipFlatCents: number;
    /** Subtotal (cents) at/above which shipping is free. Set very high to disable. */
    freeShipThresholdCents: number;
    /** Hard cap on quantity per order. */
    maxQty: number;
    /** Still cover image in /public. */
    coverImage: string;
    coverAlt: string;
    /** Optional hover/scroll preview video in /public. Empty string = none. */
    hoverVideo: string;
    /** One-line tag shown as a pill on the landing page. */
    tagline: string;
    /** Short marketing line under the title. */
    shortDescription: string;
    /** Longer body paragraphs for the "about the book" section. */
    longDescription: string[];
    /** Small hashtag-style chips under the book. */
    tags: string[];
  };

  nav: NavLink[];
  footer: { links: NavLink[] };
  social: SocialLink[];

  copy: {
    hero: {
      byline: string;
      /** Headline lines — each entry renders on its own line. */
      headline: string[];
      /** Full-bleed background slides (cross-fade carousel) from /public. */
      slides: string[];
      sub: string;
      primaryCta: { label: string; href: string };
      secondaryCta: { label: string; href: string };
    };
    quote: {
      eyebrow: string;
      text: string;
      /** Optional highlighted clause appended to the quote (gold). */
      highlight: string;
      attribution: string;
    };
    aboutBook: {
      eyebrow: string;
      headline: string;
      metaLine: string;
      body: string[];
      ctaLabel: string;
    };
    aboutAuthor: {
      eyebrow: string;
      headline: string;
      metaLine: string;
      body: string[];
      image: string;
      imageAlt: string;
      cta: { label: string; href: string };
      /** Optional "Listen" chips (songs, playlists, talks). Empty = section hidden. */
      songsLabel: string;
      songs: { label: string; href: string }[];
    };
    freeChapter: {
      eyebrow: string;
      headline: string;
      body: string;
      placeholder: string;
      submitLabel: string;
      successTitle: string;
      successBody: string;
      finePrint: string;
    };
    community: {
      eyebrow: string;
      headline: string;
      body: string;
      photos: { caption: string; image: string }[];
    };
    checkout: {
      summaryItemSubtitle: string;
      summaryItemNote: string;
      shippingNote: string;
      successTitle: string;
      successBody: string;
    };
  };

  seo: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
  };
};

export const site: SiteConfig = {
  brand: {
    siteName: "Your Brand",
    domain: "yourdomain.com",
    logo: "/placeholder/logo.svg",
    logoAlt: "Your Brand logo",
    stripeAppearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#9c7b4d", // --color-gold
        colorBackground: "#f6f2ea", // --color-paper
        colorText: "#1a1714", // --color-ink
        colorTextSecondary: "#4a443c", // --color-ink-soft
        colorDanger: "#b3261e",
        borderRadius: "8px",
        fontFamily: "system-ui, sans-serif",
      },
    },
  },

  product: {
    title: "Your Book Title",
    author: "Author Name",
    format: "Paperback",
    priceCents: 2400,
    currency: "usd",
    shipFlatCents: 500,
    freeShipThresholdCents: 4000,
    maxQty: 99,
    coverImage: "/placeholder/cover.svg",
    coverAlt: "Your Book Title — cover",
    hoverVideo: "",
    tagline: "Your Book Title",
    shortDescription: "A one-line promise of what the reader gets.",
    longDescription: [
      "Open with the core idea of the book in two or three sentences. Make it concrete enough to picture, simple enough to begin today, deep enough to return to.",
      "Follow with the why: who it is for, what changes after reading it, and the single question it keeps asking on every page.",
    ],
    tags: ["#one", "#two", "#three"],
  },

  nav: [
    { href: "#book", label: "The Book" },
    { href: "#author", label: "The Author" },
    { href: "#art", label: "Gallery" },
    { href: "#chapter", label: "Newsletter" },
  ],

  footer: {
    links: [
      { href: "#book", label: "The Book" },
      { href: "#author", label: "The Author" },
      { href: "#chapter", label: "Free Chapter" },
    ],
  },

  social: [
    { label: "Instagram", href: "https://www.instagram.com/" },
  ],

  copy: {
    hero: {
      byline: "A new book by Author Name",
      headline: ["Your Book", "Title Here"],
      slides: [
        "/placeholder/hero-1.svg",
        "/placeholder/hero-2.svg",
        "/placeholder/hero-3.svg",
      ],
      sub: "One or two sentences that capture the heart of the book and make the reader want to keep going.",
      primaryCta: { label: "Get the first chapter free", href: "#chapter" },
      secondaryCta: { label: "Read about the book", href: "#book" },
    },
    quote: {
      eyebrow: "From the book",
      text: "Drop a short, quotable line from inside the book here",
      highlight: "and let the most striking clause carry the weight.",
      attribution: "Chapter 1 · Your Book Title",
    },
    aboutBook: {
      eyebrow: "The book",
      headline: "A single promise, stated plainly.",
      metaLine: "A weekly practice · 52 chapters",
      body: [
        "Describe the structure of the book — how it is organized and how a reader moves through it. Keep it concrete.",
        "Then the deeper pull: what it draws from and the question it leaves the reader with.",
      ],
      ctaLabel: "Read the first chapter",
    },
    aboutAuthor: {
      eyebrow: "The author",
      headline: "A line about who the author is.",
      metaLine: "Writer · One short descriptor",
      body: [
        "Two or three sentences on the author's background and what they care about.",
        "A second short paragraph on the work and what it invites readers to do.",
      ],
      image: "/placeholder/author.svg",
      imageAlt: "Portrait of the author",
      cta: { label: "Get the first chapter free", href: "#chapter" },
      songsLabel: "Listen",
      songs: [],
    },
    freeChapter: {
      eyebrow: "Free chapter",
      headline: "Read the first chapter, free.",
      body: "Join the list and we'll send the opening chapter straight to your inbox.",
      placeholder: "Your email address",
      submitLabel: "Send me the chapter",
      successTitle: "Thank you.",
      successBody: "Check your inbox. The first chapter is on its way.",
      finePrint: "No spam. One chapter, then the occasional note.",
    },
    community: {
      eyebrow: "Beyond the book",
      headline: "The work beyond the page.",
      body: "A short paragraph about the mission, community, or cause behind the book.",
      photos: [
        { caption: "Caption one", image: "" },
        { caption: "Caption two", image: "" },
        { caption: "Caption three", image: "" },
      ],
    },
    checkout: {
      summaryItemSubtitle: "Paperback · by Author Name",
      summaryItemNote: "Includes free first chapter",
      shippingNote: "Free shipping over the threshold",
      successTitle: "Thank you. Your order is in.",
      successBody:
        "A confirmation is on its way to your inbox. Your order will ship shortly.",
    },
  },

  seo: {
    title: "Your Book Title — by Author Name",
    description:
      "A one-line description of the book for search engines and social cards.",
    ogTitle: "Your Book Title",
    ogDescription: "A weekly practice in becoming. Read the first chapter free.",
  },
};

export default site;
