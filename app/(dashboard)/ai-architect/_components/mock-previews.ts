export type PromptType =
  | "saas-dashboard"
  | "ai-chat"
  | "e-commerce"
  | "rest-api"
  | "blog"
  | "realtime-collab"
  | null

export const EXAMPLE_MAP: Record<string, PromptType> = {
  "Build a SaaS inventory dashboard": "saas-dashboard",
  "Create an AI-powered chat": "ai-chat",
  "Build a modern e-commerce": "e-commerce",
  "Build a production-ready REST API": "rest-api",
  "Create a blog platform": "blog",
  "Build a real-time collaborative": "realtime-collab",
}

export function detectPromptType(prompt: string): PromptType {
  for (const [prefix, type] of Object.entries(EXAMPLE_MAP)) {
    if (prompt.startsWith(prefix)) return type
  }
  return null
}

// ─── Terminal Logs (per type) ──────────────────────────────────────────

export const MOCK_TERMINAL_LOGS: Record<string, { text: string; delay: number }[]> = {
  "saas-dashboard": [
    { text: "$ npx create-next-app@latest saas-dashboard --typescript --tailwind", delay: 600 },
    { text: "  Installing dependencies... (next, react, recharts, @prisma/client)", delay: 800 },
    { text: "$ prisma migrate dev --name init", delay: 500 },
    { text: "  Prisma schema loaded from prisma/schema.prisma", delay: 300 },
    { text: "  Datasource 'db': PostgreSQL 16", delay: 200 },
    { text: "  Applying migration: 20260823_init", delay: 400 },
    { text: "$ npm run build", delay: 600 },
    { text: "  ▲ Next.js 16.3.0 (Turbopack)", delay: 300 },
    { text: "  ✓ Compiled successfully in 2.4s", delay: 400 },
    { text: "  ┌ Route (app)          Size     First Load JS", delay: 200 },
    { text: "  │ ○ /                  5.2 kB        89.3 kB", delay: 150 },
    { text: "  │ ○ /dashboard         8.1 kB        92.2 kB", delay: 150 },
    { text: "  │ ○ /dashboard/billing 6.4 kB        90.5 kB", delay: 150 },
    { text: "  └ ● /api/webhook      0.12 kB       84.2 kB", delay: 150 },
    { text: "$ docker build -t saas-dashboard .", delay: 500 },
    { text: "  Step 1/8: FROM node:20-alpine", delay: 200 },
    { text: "  Step 8/8: CMD [\"npm\", \"start\"]", delay: 200 },
    { text: " Successfully built in 12.3s", delay: 300 },
    { text: "$ deploy --env preview", delay: 400 },
    { text: "  Pushing to registry... done", delay: 300 },
    { text: "  Starting container... done", delay: 300 },
    { text: "", delay: 100 },
    { text: "  ✅ Live at https://saas-dash-8f7d.omnistack.app", delay: 0 },
  ],
  "ai-chat": [
    { text: "$ npx create-next-app@latest ai-chat --typescript --tailwind", delay: 600 },
    { text: "  Installing dependencies... (openai, ai, @prisma/client, socket.io)", delay: 800 },
    { text: "$ prisma migrate dev --name init", delay: 500 },
    { text: "  Creating table: Conversation", delay: 200 },
    { text: "  Creating table: Message", delay: 200 },
    { text: "  Creating table: User", delay: 200 },
    { text: "$ npm run build", delay: 600 },
    { text: "  ▲ Next.js 16.3.0 (Turbopack)", delay: 300 },
    { text: "  ✓ Compiled successfully in 1.9s", delay: 400 },
    { text: "  ┌ Route (app)              Size     First Load JS", delay: 200 },
    { text: "  │ ○ /                      3.8 kB        87.9 kB", delay: 150 },
    { text: "  │ ○ /chat                  12.4 kB       96.5 kB", delay: 150 },
    { text: "  │ ● /api/chat              0.08 kB       84.1 kB", delay: 150 },
    { text: "  └ ● /api/models            0.05 kB       84.1 kB", delay: 150 },
    { text: "$ docker build -t ai-chat .", delay: 500 },
    { text: "  Step 1/8: FROM node:20-alpine", delay: 200 },
    { text: "  Step 8/8: CMD [\"npm\", \"start\"]", delay: 200 },
    { text: "  Successfully built in 10.7s", delay: 300 },
    { text: "$ deploy --env preview", delay: 400 },
    { text: "  Pushing to registry... done", delay: 300 },
    { text: "  Starting container... done", delay: 300 },
    { text: "", delay: 100 },
    { text: "  ✅ Live at https://ai-chat-a3c1.omnistack.app", delay: 0 },
  ],
  "e-commerce": [
    { text: "$ npx create-next-app@latest ecommerce --typescript --tailwind", delay: 600 },
    { text: "  Installing dependencies... (stripe, @prisma/client, zustand)", delay: 800 },
    { text: "$ prisma migrate dev --name init", delay: 500 },
    { text: "  Creating table: Product", delay: 200 },
    { text: "  Creating table: Order", delay: 200 },
    { text: "  Creating table: CartItem", delay: 200 },
    { text: "  Creating table: Customer", delay: 200 },
    { text: "$ npm run build", delay: 600 },
    { text: "  ▲ Next.js 16.3.0 (Turbopack)", delay: 300 },
    { text: "  ✓ Compiled successfully in 2.1s", delay: 400 },
    { text: "  ┌ Route (app)            Size     First Load JS", delay: 200 },
    { text: "  │ ○ /                    4.1 kB        88.2 kB", delay: 150 },
    { text: "  │ ○ /products            7.8 kB        91.9 kB", delay: 150 },
    { text: "  │ ○ /cart                5.2 kB        89.3 kB", delay: 150 },
    { text: "  │ ○ /checkout            6.7 kB        90.8 kB", delay: 150 },
    { text: "  └ ● /api/stripe          0.15 kB       84.2 kB", delay: 150 },
    { text: "$ docker build -t ecommerce .", delay: 500 },
    { text: "  Step 1/8: FROM node:20-alpine", delay: 200 },
    { text: "  Step 8/8: CMD [\"npm\", \"start\"]", delay: 200 },
    { text: "  Successfully built in 11.5s", delay: 300 },
    { text: "$ deploy --env preview", delay: 400 },
    { text: "  Pushing to registry... done", delay: 300 },
    { text: "  Starting container... done", delay: 300 },
    { text: "", delay: 100 },
    { text: "  ✅ Live at https://shop-5e2b.omnistack.app", delay: 0 },
  ],
  "rest-api": [
    { text: "$ npx create-hono@latest rest-api --template nodejs", delay: 600 },
    { text: "  Installing dependencies... (hono, prisma, zod, swagger-ui-express)", delay: 800 },
    { text: "$ prisma migrate dev --name init", delay: 500 },
    { text: "  Creating table: User", delay: 200 },
    { text: "  Creating table: Role", delay: 200 },
    { text: "  Creating table: ApiKey", delay: 200 },
    { text: "$ npm run build", delay: 600 },
    { text: "  Compiling TypeScript... done in 1.2s", delay: 300 },
    { text: "  Routes registered:", delay: 200 },
    { text: "  ├─ GET    /api/health", delay: 100 },
    { text: "  ├─ POST   /api/auth/login", delay: 100 },
    { text: "  ├─ POST   /api/auth/register", delay: 100 },
    { text: "  ├─ GET    /api/users", delay: 100 },
    { text: "  ├─ GET    /api/users/:id", delay: 100 },
    { text: "  ├─ PUT    /api/users/:id", delay: 100 },
    { text: "  ├─ DELETE /api/users/:id", delay: 100 },
    { text: "  └─ GET    /api/docs (Swagger UI)", delay: 100 },
    { text: "$ docker build -t rest-api .", delay: 500 },
    { text: "  Successfully built in 8.2s", delay: 300 },
    { text: "$ deploy --env preview", delay: 400 },
    { text: "  Pushing to registry... done", delay: 300 },
    { text: "  Starting container... done", delay: 300 },
    { text: "", delay: 100 },
    { text: "  ✅ Live at https://api-7d9f.omnistack.app", delay: 0 },
  ],
  "blog": [
    { text: "$ npx create-next-app@latest blog --typescript --tailwind", delay: 600 },
    { text: "  Installing dependencies... (mdx-bundler, sharp, @prisma/client)", delay: 800 },
    { text: "$ prisma migrate dev --name init", delay: 500 },
    { text: "  Creating table: Post", delay: 200 },
    { text: "  Creating table: Category", delay: 200 },
    { text: "  Creating table: Comment", delay: 200 },
    { text: "  Creating table: Subscriber", delay: 200 },
    { text: "$ npm run build", delay: 600 },
    { text: "  ▲ Next.js 16.3.0 (Turbopack)", delay: 300 },
    { text: "  ✓ Compiled successfully in 2.0s", delay: 400 },
    { text: "  ┌ Route (app)              Size     First Load JS", delay: 200 },
    { text: "  │ ○ /                      3.5 kB        87.6 kB", delay: 150 },
    { text: "  │ ○ /blog                  6.2 kB        90.3 kB", delay: 150 },
    { text: "  │ ○ /blog/[slug]           8.9 kB        93.0 kB", delay: 150 },
    { text: "  │ ○ /rss.xml              0.02 kB       84.1 kB", delay: 150 },
    { text: "  └ ● /api/subscribe         0.08 kB       84.1 kB", delay: 150 },
    { text: "$ docker build -t blog .", delay: 500 },
    { text: "  Successfully built in 9.8s", delay: 300 },
    { text: "$ deploy --env preview", delay: 400 },
    { text: "  Pushing to registry... done", delay: 300 },
    { text: "  Starting container... done", delay: 300 },
    { text: "", delay: 100 },
    { text: "  ✅ Live at https://blog-4a8c.omnistack.app", delay: 0 },
  ],
  "realtime-collab": [
    { text: "$ npx create-next-app@latest collab --typescript --tailwind", delay: 600 },
    { text: "  Installing dependencies... (socket.io, yjs, @prisma/client, uuid)", delay: 800 },
    { text: "$ prisma migrate dev --name init", delay: 500 },
    { text: "  Creating table: Room", delay: 200 },
    { text: "  Creating table: CanvasState", delay: 200 },
    { text: "  Creating table: Participant", delay: 200 },
    { text: "$ npm run build", delay: 600 },
    { text: "  ▲ Next.js 16.3.0 (Turbopack)", delay: 300 },
    { text: "  ✓ Compiled successfully in 2.3s", delay: 400 },
    { text: "  ┌ Route (app)              Size     First Load JS", delay: 200 },
    { text: "  │ ○ /                      3.9 kB        88.0 kB", delay: 150 },
    { text: "  │ ○ /room                  7.5 kB        91.6 kB", delay: 150 },
    { text: "  │ ○ /room/:id              11.2 kB       95.3 kB", delay: 150 },
    { text: "  └ ● /api/socket            0.11 kB       84.2 kB", delay: 150 },
    { text: "$ docker build -t realtime-collab .", delay: 500 },
    { text: "  Successfully built in 10.1s", delay: 300 },
    { text: "$ deploy --env preview", delay: 400 },
    { text: "  Pushing to registry... done", delay: 300 },
    { text: "  Starting container... done", delay: 300 },
    { text: "", delay: 100 },
    { text: "  ✅ Live at https://collab-2b6e.omnistack.app", delay: 0 },
  ],
}

// ─── HTML Preview (srcdoc per type) ────────────────────────────────────

const BASE_RESET = `*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#09090b;color:#fafafa;overflow:hidden}
.sidebar{width:220px;background:#18181b;height:100vh;padding:16px;border-right:1px solid #27272a;position:fixed;left:0;top:0;display:flex;flex-direction:column;gap:8px}
.sidebar .logo{font-size:18px;font-weight:700;color:#a78bfa;margin-bottom:16px}
.sidebar a{display:block;padding:8px 12px;border-radius:8px;color:#a1a1aa;text-decoration:none;font-size:13px;transition:background .15s}
.sidebar a:hover,.sidebar a.active{background:#27272a;color:#fafafa}
.main{margin-left:220px;padding:24px;height:100vh;overflow-y:auto}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px}
.stat{background:#18181b;border:1px solid #27272a;border-radius:12px;padding:16px}
.stat .label{font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:.05em}
.stat .value{font-size:28px;font-weight:700;margin-top:4px}
.stat .change{font-size:12px;color:#22c55e;margin-top:2px}
.chart-bar{height:8px;border-radius:4px;margin-top:4px}
.card{background:#18181b;border:1px solid #27272a;border-radius:12px;padding:20px;margin-bottom:16px}
.card h3{font-size:14px;font-weight:600;margin-bottom:12px}
table{width:100%;border-collapse:collapse;font-size:13px}
th{text-align:left;padding:8px 12px;color:#71717a;border-bottom:1px solid #27272a}
td{padding:8px 12px;border-bottom:1px solid #1c1c1f}
.badge{display:inline-block;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:500}
.badge.green{background:#052e16;color:#22c55e;border:1px solid #166534}
.badge.blue{background:#172554;color:#3b82f6;border:1px solid #1e3a5f}
.badge.yellow{background:#422006;color:#eab308;border:1px solid #854d0e}
.badge.red{background:#450a0a;color:#ef4444;border:1px solid #991b1b}
.flex{display:flex}.items-center{align-items:center}.gap-2{gap:8px}.gap-4{gap:16px}.mb-4{margin-bottom:16px}.mb-2{margin-bottom:8px}.text-xs{font-size:12px}.text-muted{color:#71717a}.font-bold{font-weight:700}.w-full{width:100%}`

export const MOCK_HTML_PREVIEWS: Record<string, string> = {
  "saas-dashboard": `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SaaS Dashboard</title><style>${BASE_RESET}
.stats{grid-template-columns:repeat(2,1fr)}
.table-wrap{overflow-x:auto}</style></head><body>
<div class="sidebar"><div class="logo">📊 SaaS Dashboard</div><a href="#" class="active">Overview</a><a href="#">Products</a><a href="#">Orders</a><a href="#">Customers</a><a href="#">Analytics</a><a href="#">Settings</a></div>
<div class="main">
<div class="stats">
<div class="stat"><div class="label">Monthly Recurring Revenue</div><div class="value" style="color:#22c55e">$48,250</div><div class="change">↑ 12.5% vs bulan lalu</div></div>
<div class="stat"><div class="label">Total Users</div><div class="value">2,847</div><div class="change">↑ 8.2% vs bulan lalu</div></div>
<div class="stat"><div class="label">Active Subscriptions</div><div class="value">1,423</div><div class="change">↑ 3.1% vs bulan lalu</div></div>
<div class="stat"><div class="label">Churn Rate</div><div class="value" style="color:#ef4444">2.4%</div><div class="change" style="color:#ef4444">↑ 0.3% vs bulan lalu</div></div>
</div>
<div class="card"><h3>Revenue Overview</h3><div style="display:flex;align-items:flex-end;gap:12px;height:120px;padding-top:8px">
<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px"><div class="chart-bar" style="height:40%;width:100%;background:#3b82f6"></div><span class="text-xs text-muted">Jan</span></div>
<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px"><div class="chart-bar" style="height:55%;width:100%;background:#3b82f6"></div><span class="text-xs text-muted">Feb</span></div>
<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px"><div class="chart-bar" style="height:45%;width:100%;background:#3b82f6"></div><span class="text-xs text-muted">Mar</span></div>
<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px"><div class="chart-bar" style="height:70%;width:100%;background:#3b82f6"></div><span class="text-xs text-muted">Apr</span></div>
<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px"><div class="chart-bar" style="height:65%;width:100%;background:#3b82f6"></div><span class="text-xs text-muted">May</span></div>
<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px"><div class="chart-bar" style="height:85%;width:100%;background:#a78bfa"></div><span class="text-xs text-muted">Jun</span></div>
</div></div>
<div class="table-wrap"><div class="card"><h3>Recent Orders</h3><table><tr><th>Order ID</th><th>Customer</th><th>Plan</th><th>Amount</th><th>Status</th></tr><tr><td>#ORD-1847</td><td>Sarah Chen</td><td>Enterprise</td><td>$99/mo</td><td><span class="badge green">Paid</span></td></tr><tr><td>#ORD-1846</td><td>Marcus Johnson</td><td>Pro</td><td>$29/mo</td><td><span class="badge green">Paid</span></td></tr><tr><td>#ORD-1845</td><td>Anika Patel</td><td>Enterprise</td><td>$99/mo</td><td><span class="badge yellow">Pending</span></td></tr><tr><td>#ORD-1844</td><td>Li Wei</td><td>Pro</td><td>$29/mo</td><td><span class="badge green">Paid</span></td></tr><tr><td>#ORD-1843</td><td>Emma Davis</td><td>Free</td><td>$0</td><td><span class="badge blue">Trial</span></td></tr></table></div></div>
</div></body></html>`,

  "ai-chat": `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AI Chat App</title><style>${BASE_RESET}
.sidebar{width:260px}
.main{margin-left:260px;display:flex;flex-direction:column;height:100vh}
.chat-header{padding:16px 24px;border-bottom:1px solid #27272a;display:flex;align-items:center;gap:12px}
.messages{flex:1;overflow-y:auto;padding:24px;display:flex;flex-direction:column;gap:16px}
.msg{max-width:75%;padding:12px 16px;border-radius:16px;font-size:14px;line-height:1.5}
.msg.user{align-self:flex-end;background:#6d28d9;color:white;border-bottom-right-radius:4px}
.msg.assistant{align-self:flex-start;background:#27272a;border-bottom-left-radius:4px}
.msg .model{font-size:11px;color:#a78bfa;margin-bottom:4px;font-weight:600}
.input-bar{padding:16px 24px;border-top:1px solid #27272a;display:flex;gap:8px}
.input-bar input{flex:1;background:#18181b;border:1px solid #27272a;border-radius:12px;padding:12px 16px;color:#fafafa;font-size:14px;outline:none}
.input-bar button{background:#7c3aed;color:white;border:none;border-radius:12px;padding:12px 20px;font-weight:600;cursor:pointer;font-size:14px}
.new-chat{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:8px;background:#27272a;color:#fafafa;border:none;width:100%;cursor:pointer;font-size:13px;margin-bottom:12px}
.chat-list{font-size:13px;color:#a1a1aa;display:flex;flex-direction:column;gap:2px}
.chat-list a{display:block;padding:8px 12px;border-radius:8px;color:#a1a1aa;text-decoration:none}
.chat-list a:hover,.chat-list a.active{background:#27272a;color:#fafafa}</style></head><body>
<div class="sidebar"><div class="logo">💬 AI Chat</div><button class="new-chat">+ New Chat</button><div class="chat-list"><a href="#" class="active">Build a REST API with auth</a><a href="#">Explain React Server Components</a><a href="#">Debug TypeScript error</a><a href="#">Write unit tests for UserService</a></div></div>
<div class="main">
<div class="chat-header"><span style="font-weight:600">GPT-4o</span><span class="badge blue">Pro</span><span class="text-muted text-xs">Context: 128k tokens</span></div>
<div class="messages">
<div class="msg user">How do I implement JWT authentication in a Next.js 16 app with role-based access control?</div>
<div class="msg assistant"><div class="model">GPT-4o</div>Great question! Here's a comprehensive approach:<br><br><strong>1. Install dependencies:</strong><br><code style="background:#18181b;padding:2px 6px;border-radius:4px">npm install jsonwebtoken bcryptjs</code><br><br><strong>2. Create auth middleware:</strong><br>Create <code>middleware.ts</code> that verifies JWT tokens on protected routes and checks user roles from the decoded payload.<br><br><strong>3. Role-based access:</strong><br>Define roles (ADMIN, USER, VIEWER) and create a <code>withAuth</code> HOC that wraps server components to check permissions before rendering.</div>
<div class="msg user">Can you show me the middleware code?</div>
<div class="msg assistant"><div class="model">GPT-4o</div>Here's the middleware implementation:<br><br><pre style="background:#18181b;padding:12px;border-radius:8px;font-size:12px;margin-top:8px;overflow-x:auto"><code>import { NextResponse } from 'next/server'<br>import { verifyToken } from '@/lib/auth'<br><br>export async function middleware(request) {<br>  const token = request.cookies.get('token')<br>  if (!token) return NextResponse.redirect('/login')<br>  try {<br>    const payload = verifyToken(token)<br>    request.headers.set('x-user-role', payload.role)<br>    return NextResponse.next()<br>  } catch {<br>    return NextResponse.redirect('/login')<br>  }<br>}</code></pre></div>
</div>
<div class="input-bar"><input placeholder="Message AI Chat..." value="Thanks! How about rate limiting?"><button>Send</button></div>
</div></body></html>`,

  "e-commerce": `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>E-Commerce Store</title><style>${BASE_RESET}
.topbar{position:fixed;top:0;left:0;right:0;height:56px;background:#18181b;border-bottom:1px solid #27272a;display:flex;align-items:center;padding:0 24px;z-index:10;gap:24px}
.topbar .logo{font-size:18px;font-weight:700;color:#fafafa}
.topbar nav{display:flex;gap:16px;font-size:14px}
.topbar nav a{color:#a1a1aa;text-decoration:none}
.topbar nav a:hover{color:#fafafa}
.topbar .cart{margin-left:auto;position:relative}
.main{padding:80px 24px 24px}
.products{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.product{background:#18181b;border:1px solid #27272a;border-radius:12px;overflow:hidden;transition:border-color .15s}
.product:hover{border-color:#52525b}
.product-img{height:180px;background:#27272a;display:flex;align-items:center;justify-content:center;font-size:48px}
.product-info{padding:16px}
.product-info h3{font-size:15px;font-weight:600;margin-bottom:4px}
.product-info .desc{font-size:13px;color:#71717a;margin-bottom:8px}
.product-info .price{font-size:18px;font-weight:700;color:#a78bfa}
.product-info .add{width:100%;margin-top:12px;background:#7c3aed;color:white;border:none;border-radius:8px;padding:10px;font-weight:600;cursor:pointer;font-size:13px}
.hero-banner{background:linear-gradient(135deg,#1e1b4b,#312e81);border-radius:16px;padding:40px;margin-bottom:24px;text-align:center}
.hero-banner h1{font-size:32px;font-weight:800;margin-bottom:8px}
.hero-banner p{color:#a5b4fc;font-size:16px}</style></head><body>
<div class="topbar"><span class="logo">🛍️ ShopStack</span><nav><a href="#">Home</a><a href="#">Products</a><a href="#">Categories</a><a href="#">Deals</a></nav><div class="cart">🛒 <span class="badge green">3</span></div></div>
<div class="main">
<div class="hero-banner"><h1>Summer Sale — 40% Off</h1><p>Discover premium products at unbeatable prices</p></div>
<div class="products">
<div class="product"><div class="product-img">🎧</div><div class="product-info"><h3>Wireless Pro Headphones</h3><div class="desc">Noise-cancelling, 40hr battery</div><div class="price">$179 <span style="font-size:13px;color:#71717a;text-decoration:line-through">$299</span></div><button class="add">Add to Cart</button></div></div>
<div class="product"><div class="product-img">⌚</div><div class="product-info"><h3>Smart Watch Ultra</h3><div class="desc">GPS, health tracking, 7-day battery</div><div class="price">$349 <span style="font-size:13px;color:#71717a;text-decoration:line-through">$599</span></div><button class="add">Add to Cart</button></div></div>
<div class="product"><div class="product-img">📱</div><div class="product-info"><h3>Phone Case Pro</h3><div class="desc">MagSafe compatible, military-grade</div><div class="price">$39 <span style="font-size:13px;color:#71717a;text-decoration:line-through">$65</span></div><button class="add">Add to Cart</button></div></div>
<div class="product"><div class="product-img">💻</div><div class="product-info"><h3>USB-C Hub 7-in-1</h3><div class="desc">HDMI, SD, USB 3.0, PD 100W</div><div class="price">$59 <span style="font-size:13px;color:#71717a;text-decoration:line-through">$89</span></div><button class="add">Add to Cart</button></div></div>
<div class="product"><div class="product-img">🔋</div><div class="product-info"><h3>Power Bank 20K</h3><div class="desc">Fast charging, dual port</div><div class="price">$45 <span style="font-size:13px;color:#71717a;text-decoration:line-through">$75</span></div><button class="add">Add to Cart</button></div></div>
<div class="product"><div class="product-img">📷</div><div class="product-info"><h3>Webcam 4K</h3><div class="desc">Auto-focus, noise-cancelling mic</div><div class="price">$129 <span style="font-size:13px;color:#71717a;text-decoration:line-through">$199</span></div><button class="add">Add to Cart</button></div></div>
</div></div></body></html>`,

  "rest-api": `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>REST API Docs</title><style>${BASE_RESET}
.main{margin-left:280px;padding:32px;max-width:900px}
.sidebar{width:280px}
.sidebar .logo{padding:16px;font-size:18px;font-weight:700;color:#a78bfa}
.sidebar .section{padding:8px 16px;font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#52525b;margin-top:12px}
.sidebar a{display:block;padding:6px 16px;font-size:13px;color:#a1a1aa;text-decoration:none;font-family:monospace}
.sidebar a:hover,.sidebar a.active{background:#27272a;color:#fafafa}
.method{display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;font-family:monospace;margin-right:8px;min-width:52px;text-align:center}
.get{background:#052e16;color:#22c55e;border:1px solid #166534}
.post{background:#172554;color:#3b82f6;border:1px solid #1e3a5f}
.put{background:#422006;color:#eab308;border:1px solid #854d0e}
.del{background:#450a0a;color:#ef4444;border:1px solid #991b1b}
.endpoint{background:#18181b;border:1px solid #27272a;border-radius:12px;padding:16px;margin-bottom:12px;display:flex;align-items:center}
.endpoint .path{font-family:monospace;font-size:14px;color:#fafafa}
.endpoint .desc{margin-left:auto;color:#71717a;font-size:13px}
h2{font-size:20px;font-weight:700;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid #27272a}
.badge{display:inline-block;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:500}
.badge.green{background:#052e16;color:#22c55e;border:1px solid #166534}</style></head><body>
<div class="sidebar"><div class="logo">⚡ REST API</div><div class="section">Authentication</div><a href="#" class="active">POST /auth/login</a><a href="#">POST /auth/register</a><div class="section">Users</div><a href="#">GET /users</a><a href="#">GET /users/:id</a><a href="#">PUT /users/:id</a><a href="#">DELETE /users/:id</a><div class="section">API Keys</div><a href="#">GET /api-keys</a><a href="#">POST /api-keys</a><a href="#">DELETE /api-keys/:id</a></div>
<div class="main">
<h2>REST API — Production Ready <span class="badge green">v1.0.0</span></h2>
<p class="text-muted mb-4" style="margin-bottom:24px;font-size:14px">Base URL: <code style="background:#27272a;padding:2px 6px;border-radius:4px">https://api-7d9f.omnistack.app</code></p>
<h2 style="font-size:16px">Authentication</h2>
<div class="endpoint"><span class="method post">POST</span><span class="path">/api/auth/login</span><span class="desc">Login with email & password, returns JWT</span></div>
<div class="endpoint"><span class="method post">POST</span><span class="path">/api/auth/register</span><span class="desc">Create new user account</span></div>
<h2 style="font-size:16px;margin-top:24px">Users</h2>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/users</span><span class="desc">List all users (ADMIN only)</span></div>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/users/:id</span><span class="desc">Get user by ID</span></div>
<div class="endpoint"><span class="method put">PUT</span><span class="path">/api/users/:id</span><span class="desc">Update user profile</span></div>
<div class="endpoint"><span class="method del">DEL</span><span class="path">/api/users/:id</span><span class="desc">Delete user (ADMIN only)</span></div>
<h2 style="font-size:16px;margin-top:24px">API Keys</h2>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/api-keys</span><span class="desc">List your API keys</span></div>
<div class="endpoint"><span class="method post">POST</span><span class="path">/api/api-keys</span><span class="desc">Generate new API key</span></div>
<div class="endpoint"><span class="method del">DEL</span><span class="path">/api/api-keys/:id</span><span class="desc">Revoke API key</span></div>
</div></body></html>`,

  "blog": `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Blog Platform</title><style>${BASE_RESET}
.topbar{position:fixed;top:0;left:0;right:0;height:56px;background:#18181b;border-bottom:1px solid #27272a;display:flex;align-items:center;padding:0 24px;z-index:10;gap:24px}
.topbar .logo{font-size:18px;font-weight:700;color:#fafafa}
.topbar nav{display:flex;gap:16px;font-size:14px}
.topbar nav a{color:#a1a1aa;text-decoration:none}
.topbar nav a:hover{color:#fafafa}
.main{padding:80px 24px;max-width:800px;margin:0 auto}
.post{margin-bottom:40px;padding-bottom:40px;border-bottom:1px solid #27272a}
.post:last-child{border-bottom:none}
.post .meta{font-size:13px;color:#71717a;margin-bottom:8px;display:flex;gap:12px;align-items:center}
.post h2{font-size:24px;font-weight:700;margin-bottom:8px;line-height:1.3}
.post h2 a{color:#fafafa;text-decoration:none}
.post h2 a:hover{color:#a78bfa}
.post .excerpt{color:#a1a1aa;font-size:15px;line-height:1.6;margin-bottom:12px}
.post .tags{display:flex;gap:8px;flex-wrap:wrap}
.tag{background:#27272a;padding:4px 10px;border-radius:6px;font-size:12px;color:#a1a1aa}
.subscribe{background:linear-gradient(135deg,#1e1b4b,#312e81);border-radius:12px;padding:32px;text-align:center;margin-bottom:40px}
.subscribe h3{font-size:20px;font-weight:700;margin-bottom:8px}
.subscribe p{color:#a5b4fc;font-size:14px;margin-bottom:16px}
.subscribe form{display:flex;gap:8px;justify-content:center}
.subscribe input{background:#18181b;border:1px solid #27272a;border-radius:8px;padding:10px 16px;color:#fafafa;font-size:14px;width:280px;outline:none}
.subscribe button{background:#7c3aed;color:white;border:none;border-radius:8px;padding:10px 20px;font-weight:600;cursor:pointer}</style></head><body>
<div class="topbar"><span class="logo">✍️ Blog</span><nav><a href="#">Home</a><a href="#">Archive</a><a href="#">Tags</a><a href="#">About</a></nav></div>
<div class="main">
<div class="subscribe"><h3>Stay Updated</h3><p>Get the latest articles delivered straight to your inbox.</p><form><input placeholder="your@email.com"><button>Subscribe</button></form></div>
<div class="post"><div class="meta"><span>Aug 23, 2026</span><span>·</span><span>5 min read</span><span class="badge blue">Tutorial</span></div><h2><a href="#">Building a Modern SaaS Dashboard with Next.js 16</a></h2><p class="excerpt">Learn how to build a production-ready SaaS dashboard with real-time charts, role-based access, and Stripe billing integration using the latest Next.js features.</p><div class="tags"><span class="tag">Next.js</span><span class="tag">TypeScript</span><span class="tag">SaaS</span></div></div>
<div class="post"><div class="meta"><span>Aug 20, 2026</span><span>·</span><span>8 min read</span><span class="badge green">Guide</span></div><h2><a href="#">AI-Powered Code Review: Best Practices for 2026</a></h2><p class="excerpt">Explore how AI tools are transforming code review workflows, and learn practical strategies for integrating AI assistants into your development process.</p><div class="tags"><span class="tag">AI</span><span class="tag">DevOps</span><span class="tag">Productivity</span></div></div>
<div class="post"><div class="meta"><span>Aug 17, 2026</span><span>·</span><span>4 min read</span><span class="badge yellow">Opinion</span></div><h2><a href="#">Why We Chose Hono Over Express for Our API</a></h2><p class="excerpt">After running Express in production for 3 years, we migrated to Hono. Here's what we learned about performance, DX, and the edge computing future.</p><div class="tags"><span class="tag">Hono</span><span class="tag">Node.js</span><span class="tag">Performance</span></div></div>
</div></body></html>`,

  "realtime-collab": `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Realtime Collab</title><style>${BASE_RESET}
.topbar{position:fixed;top:0;left:0;right:0;height:48px;background:#18181b;border-bottom:1px solid #27272a;display:flex;align-items:center;padding:0 16px;z-index:10;gap:12px}
.topbar .logo{font-size:16px;font-weight:700;color:#fafafa}
.main{display:flex;height:calc(100vh - 48px);margin-top:48px}
.toolbar{width:48px;background:#18181b;border-right:1px solid #27272a;display:flex;flex-direction:column;align-items:center;padding:8px 0;gap:4px}
.toolbar button{width:36px;height:36px;border-radius:8px;border:none;background:transparent;color:#71717a;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px}
.toolbar button:hover,.toolbar button.active{background:#27272a;color:#fafafa}
.canvas-wrap{flex:1;position:relative;background:#09090b;overflow:hidden}
canvas{display:block;width:100%;height:100%}
.cursor{position:absolute;pointer-events:none}
.cursor .dot{width:12px;height:12px;border-radius:50%;border:2px solid white}
.cursor .name{font-size:10px;padding:1px 6px;border-radius:4px;color:white;white-space:nowrap;margin-top:2px;margin-left:8px}
.sidebar-right{width:240px;background:#18181b;border-left:1px solid #27272a;padding:12px;display:flex;flex-direction:column;gap:8px}
.participant{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:8px}
.participant .avatar{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:white}
.participant .info{font-size:13px}
.participant .status{font-size:11px;color:#71717a}
.online-dot{width:8px;height:8px;border-radius:50%;background:#22c55e;margin-left:auto}
.room-id{font-family:monospace;font-size:11px;color:#52525b;background:#27272a;padding:4px 8px;border-radius:4px;text-align:center;margin-top:8px}</style></head><body>
<div class="topbar"><span class="logo">🎨 Collab Board</span><span class="text-muted text-xs">Room: design-review-2026</span><span style="margin-left:auto" class="text-muted text-xs">3 participants online</span></div>
<div class="main">
<div class="toolbar"><button class="active" title="Select">👆</button><button title="Pen">✏️</button><button title="Rectangle">⬜</button><button title="Circle">⭕</button><button title="Text">T</button><button title="Eraser">🧹</button></div>
<div class="canvas-wrap"><canvas id="c"></canvas>
<div class="cursor" style="left:340px;top:180px"><div class="dot" style="background:#ef4444"></div><div class="name" style="background:#ef4444">Alice</div></div>
<div class="cursor" style="left:520px;top:300px"><div class="dot" style="background:#3b82f6"></div><div class="name" style="background:#3b82f6">Bob</div></div></div>
<div class="sidebar-right">
<div style="font-size:12px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Participants</div>
<div class="participant"><div class="avatar" style="background:#7c3aed">You</div><div class="info"><div>You (Owner)</div><div class="status">Editing...</div></div><div class="online-dot"></div></div>
<div class="participant"><div class="avatar" style="background:#ef4444">A</div><div class="info"><div>Alice Chen</div><div class="status">Viewing</div></div><div class="online-dot"></div></div>
<div class="participant"><div class="avatar" style="background:#3b82f6">B</div><div class="info"><div>Bob Smith</div><div class="status">Drawing...</div></div><div class="online-dot"></div></div>
<div class="room-id">design-review-2026</div>
</div></div>
<script>
var c=document.getElementById('c'),ctx=c.getContext('2d');
c.width=c.parentElement.clientWidth;c.height=c.parentElement.clientHeight;
ctx.strokeStyle='#52525b';ctx.lineWidth=2;
[[120,80,320,80],[320,80,320,280],[320,280,120,280],[120,280,120,80]].forEach(function(l){ctx.beginPath();ctx.moveTo(l[0],l[1]);ctx.lineTo(l[2],l[3]);ctx.stroke()});
ctx.strokeStyle='#a78bfa';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(160,140);ctx.quadraticCurveTo(220,100,280,160);ctx.quadraticCurveTo(320,200,260,240);ctx.stroke();
ctx.strokeStyle='#22c55e';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(140,320);ctx.lineTo(350,320);ctx.stroke();
ctx.fillStyle='#71717a';ctx.font='12px sans-serif';ctx.fillText('Dashboard Wireframe',150,60);ctx.fillText('User Flow',340,310);
</script></body></html>`,
}
