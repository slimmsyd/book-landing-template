# Asset checklist

Replace the placeholders in `/public/placeholder/` with your real assets, then
point `site.config.ts` at them. You can keep them in `/public/placeholder/` or
move them to `/public/` — just match the path in the config.

| Config field                 | Placeholder shipped            | Recommended file            | Size / ratio        |
| ---------------------------- | ------------------------------ | --------------------------- | ------------------- |
| `brand.logo`                 | `/placeholder/logo.svg`        | `/logo.svg` or `.png`       | ~184×46, transparent |
| `product.coverImage`         | `/placeholder/cover.svg`       | `/cover.png`                | 440×560, ~4:5       |
| `product.hoverVideo`         | _(empty — none)_               | `/book-hover.mp4`           | square-ish, muted, < 2 MB, plays once |
| `copy.hero.slides[]`         | `/placeholder/hero-1..3.svg`   | `/hero-1.jpg` …             | 1600×1000, full-bleed |
| `copy.aboutAuthor.image`     | `/placeholder/author.svg`      | `/author.jpg`               | 480×600, ~4:5       |

## Social / SEO images (Next.js file conventions — optional)

Drop these into `app/` and Next auto-wires them (no config needed):

| File                          | Purpose                       | Size      |
| ----------------------------- | ----------------------------- | --------- |
| `app/icon.png`                | Favicon / tab icon            | 512×512   |
| `app/apple-icon.png`          | iOS home-screen icon          | 180×180   |
| `app/opengraph-image.png`     | Social share card (OG)        | 1200×630  |
| `app/twitter-image.png`       | Twitter/X share card          | 1200×630  |

## Instagram gallery (optional)

The drifting gallery (`ArtCarousel`) reads
`public/assets/instagram/manifest.json`:

```json
{
  "posts": [
    {
      "shortCode": "ABC123",
      "postUrl": "https://www.instagram.com/p/ABC123/",
      "caption": "First line becomes the alt text",
      "timestamp": "2026-01-01T00:00:00Z",
      "files": ["ABC123_0.jpg", "ABC123_1.jpg"]
    }
  ]
}
```

Put the referenced image files in the same folder. If the manifest is missing,
the gallery section simply hides itself.
