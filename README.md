# ohimg-js

JavaScript/TypeScript SDK for OhImg - Open Graph Image Generator. Generate secure, signed Open Graph images for your website.

## Features

- 🔒 Secure URL generation with HMAC signatures
- 🌐 Works everywhere (Node.js, Browsers, Deno, Cloudflare Workers)
- 📦 Zero dependencies
- 💪 Full TypeScript support
- ⚡ Async/await API

## Installation

```bash
npm install ohimg-js
# or
yarn add ohimg-js
# or
pnpm add ohimg-js
```

## Quick Start

```typescript
import { OhImg } from "ohimg-js";

const ohimg = new OhImg({
  publishableKey: "omg_pub_xxxx", // Your OhImg API key
  publishableSecret: "omg_whsec_xxxx", // Your OhImg webhook secret
});

const ogImageUrl = await ohimg.getImageUrl({
  path: "/blog/my-post",
  domain: "https://myblog.com",
});
```

## Framework Examples

### Next.js

```typescript
// pages/blog/[slug].tsx
import { OhImg } from "ohimg-js";

export default function BlogPost({ ogImageUrl }) {
  return (
    <Head>
      <meta property="og:image" content={ogImageUrl} />
      <meta property="twitter:image" content={ogImageUrl} />
    </Head>
  );
}

export async function getStaticProps({ params }) {
  const ohimg = new OhImg({
    publishableKey: process.env.OHIMG_API_KEY!,
    publishableSecret: process.env.OHIMG_WEBHOOK_SECRET!,
  });

  const ogImageUrl = await ohimg.getImageUrl({
    path: `/blog/${params.slug}`,
    domain: process.env.NEXT_PUBLIC_DOMAIN!,
  });

  return {
    props: { ogImageUrl },
  };
}
```

### Astro

```astro
---
import { OhImg } from 'ohimg-js';

const ohimg = new OhImg({
  publishableKey: import.meta.env.OHIMG_API_KEY,
  publishableSecret: import.meta.env.OHIMG_WEBHOOK_SECRET
});

const ogImageUrl = await ohimg.getImageUrl({
  path: Astro.url.pathname,
  domain: import.meta.env.SITE
});
---

<meta property="og:image" content={ogImageUrl} />
```

## API Reference

### Configuration

```typescript
const ohimg = new OhImg({
  publishableKey: string;        // Required: Your OhImg API key
  publishableSecret: string; // Required: Your OhImg webhook secret
  baseUrl?: string;      // Optional: Custom base URL (default: https://og.ohimg.dev)
});
```

### Methods

#### getImageUrl(input)

Generate a complete OG image URL.

```typescript
const url = await ohimg.getImageUrl({
  path: string;   // Required: Path of the page (e.g., '/blog/post')
  domain: string; // Required: Full domain with protocol (e.g., 'https://example.com')
});
```

#### generateSignature(input)

Generate signature components separately.

```typescript
const {
  signature,  // Generated HMAC signature
  timestamp,  // Unix timestamp
  fullUrl     // Complete URL
} = await ohimg.generateSignature({
  path: string;   // Required: Path of the page
  domain: string; // Required: Full domain with protocol
});
```

### Helper Function

For one-off usage:

```typescript
import { getOGImageUrl } from "ohimg-js";

const ogImageUrl = await getOGImageUrl(
  {
    publishableKey: "omg_pub_xxxx",
    publishableSecret: "omg_whsec_xxxx",
  },
  {
    path: "/about",
    domain: "https://myblog.com",
  }
);
```

## Environment Variables

```env
OHIMG_API_KEY=omg_pub_xxxx
OHIMG_WEBHOOK_SECRET=omg_whsec_xxxx
```

## Security

This SDK uses HMAC-SHA256 for request signing with these security features:

- Timestamp-based request validation
- Domain validation
- URL tampering prevention
- Protocol enforcement

## Troubleshooting

Common errors:

```typescript
// Domain must include protocol
❌ domain: 'myblog.com'
✅ domain: 'https://myblog.com'

// Path must start with /
❌ path: 'blog/post'
✅ path: '/blog/post'

// API key and webhook secret required
❌ new OhImg({ publishableKey: '' })
✅ new OhImg({ publishableKey: 'omg_pub_xxx', publishableSecret: 'omg_whsec_xxx' })
```

## License

MIT

## Support

- GitHub Issues: [Report a bug](https://github.com/ohimg/ohimg-js/issues)
- Twitter: [@rjvim](https://twitter.com/rjvim)
- Contact Email: rajiv@betalectic.com
