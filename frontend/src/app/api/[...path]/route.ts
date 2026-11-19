import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const backendOrigin = (
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000"
).replace(/\/api\/?$/, "");

const SKIP_REQ = new Set(["host", "connection", "content-length"]);
const SKIP_RES = new Set([
  "connection",
  "transfer-encoding",
  "keep-alive",
  "content-encoding",
  "content-length",
]);

async function proxy(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const target = `${backendOrigin}/api/${path.join("/")}${req.nextUrl.search}`;
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!SKIP_REQ.has(key.toLowerCase())) headers.set(key, value);
  });

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  let res: Response;
  try {
    res = await fetch(target, {
      method: req.method,
      headers,
      body: hasBody ? await req.arrayBuffer() : undefined,
      redirect: "manual",
    });
  } catch {
    return Response.json(
      { message: "The API is waking up or unreachable. Wait a few seconds and try again." },
      { status: 503 },
    );
  }

  const out = new Headers();
  res.headers.forEach((value, key) => {
    if (!SKIP_RES.has(key.toLowerCase()) && key.toLowerCase() !== "set-cookie") {
      out.append(key, value);
    }
  });
  const cookies =
    typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
  if (cookies.length) {
    for (const cookie of cookies) out.append("set-cookie", cookie);
  } else {
    const single = res.headers.get("set-cookie");
    if (single) out.append("set-cookie", single);
  }
  return new Response(res.body, { status: res.status, headers: out });
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;
