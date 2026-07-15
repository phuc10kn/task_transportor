import { NextRequest } from "next/server";

export const runtime = "nodejs";

const apiOrigin = process.env.CIS_API_ORIGIN?.replace(/\/$/, "");

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  if (!apiOrigin) return Response.json({ error: { code: "API_ORIGIN_MISSING", message: "CIS_API_ORIGIN is required." } }, { status: 500 });
  const { path } = await context.params;
  const headers = new Headers();
  for (const name of ["authorization", "content-type", "accept", "x-correlation-id"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer();
  try {
    const upstream = await fetch(`${apiOrigin}/api/v1/${path.join("/")}${request.nextUrl.search}`, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });
    const contentType = upstream.headers.get("content-type") || "application/json";
    const payload = await upstream.arrayBuffer();
    return new Response(payload, { status: upstream.status, headers: { "content-type": contentType } });
  } catch {
    return Response.json({ error: { code: "CIS_API_UNAVAILABLE", message: "CIS API is unavailable. Start the Express server and retry." } }, { status: 503 });
  }
}

export const GET = proxy;
export const HEAD = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
