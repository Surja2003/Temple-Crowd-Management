This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Backend Integration (FastAPI)

- Set `NEXT_PUBLIC_API_URL` (and optionally `NEXT_PUBLIC_WS_URL`) in `.env.local`. See `.env.local.example`.
- Ensure FastAPI CORS allows `http://localhost:3000` (or your frontend origin).

Example FastAPI CORS setup:

```python
from fastapi.middleware.cors import CORSMiddleware

origins = [
	"http://localhost:3000",
	"http://127.0.0.1:3000",
]

app.add_middleware(
	CORSMiddleware,
	allow_origins=origins,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)
```

If using WebSockets, expose a WS URL such as `ws://localhost:8001` and set `NEXT_PUBLIC_WS_URL` accordingly.

## API Smoke Test

Quickly probe key endpoints against your FastAPI server:

```bash
npm run smoke
# Optional auth check
$env:SMOKE_AUTH="1"; npm run smoke
```

Environment overrides:

- `TEMPLE_SLUG` to change the target temple (default: `sri-ganesh-temple`).
- `NEXT_PUBLIC_API_URL` to point at your API server (default: `http://localhost:8001`).

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
