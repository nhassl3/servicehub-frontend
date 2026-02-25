# ServiceHub — Frontend

React + TypeScript frontend for the ServiceHub digital marketplace platform.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 7** — build tool with HMR
- **React Router 7** — client-side routing
- **Axios** — HTTP client
- **React Icons** — icon library
- **ESLint** — linting
- **Docker** — containerized with Nginx 1.27 (alpine)

## Project Structure

```
src/
├── api/          # Axios API clients (auth, products, cart, orders, etc.)
├── components/   # Reusable UI components (layout, product cards)
├── context/      # React contexts (AuthContext, CartContext)
├── hooks/        # Custom hooks (useDebounce)
├── pages/        # Page-level components
├── store/        # Token storage utilities
├── styles/       # Global CSS (reset, variables, globals)
└── types/        # Shared TypeScript interfaces
```

## Pages

| Route | Access | Description |
|---|---|---|
| `/` | Public | Home page |
| `/catalog` | Public | Product catalog with filters |
| `/products/:id` | Public | Product detail & reviews |
| `/sellers/:username` | Public | Seller public profile |
| `/login` | Guest only | Login |
| `/register` | Guest only | Registration |
| `/cart` | Auth | Shopping cart |
| `/orders` | Auth | Order history |
| `/orders/:id` | Auth | Order detail |
| `/wishlist` | Auth | Saved products |
| `/balance` | Auth | Balance & transactions |
| `/profile` | Auth | User profile settings |
| `/sellers/create` | Auth | Become a seller |
| `/seller/dashboard` | Auth | Seller dashboard |

## Getting Started

### Prerequisites

- Node.js 22+
- npm

### Local Development

```bash
# Install dependencies
npm install

# Copy env file
cp .env.example .env
# Set VITE_API_URL to your backend address

# Start dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build

```bash
npm run build
```

Output is placed in `dist/`.

### Lint

```bash
npm run lint
```

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend base URL | `http://localhost:8080` |

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:8080
```

## Docker

### Build image

```bash
docker build \
  --build-arg VITE_API_URL=http://localhost:8080 \
  -t servicehub-frontend .
```

### Run container

```bash
docker run -p 80:80 servicehub-frontend
```

The Dockerfile uses a multi-stage build:
1. **Builder** — Node 22 alpine, runs `npm ci` and `npm run build`
2. **Runtime** — Nginx 1.27 alpine serves the static `dist/` output

Nginx is configured with:
- SPA fallback (`try_files` → `index.html`)
- API reverse proxy (`/api/` → `backend:8080`)
- Static asset caching (30 days)
- Gzip compression
- Security headers (X-Frame-Options, X-Content-Type-Options, XSS-Protection)

## Part of ServiceHub

This repository is the frontend service of the ServiceHub platform.
The full stack includes:

- **[servicehub-backend](https://github.com/your-org/servicehub-backend)** — Golang + gRPC + REST gateway
- **[servicehub-frontend](https://github.com/your-org/servicehub-frontend)** — this repository
- PostgreSQL 18 (alpine) as the database
- Deployed via Docker Compose + GitHub Actions CI/CD
