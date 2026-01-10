import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

function getBackendBase() {
  const fromPublic = process.env.NEXT_PUBLIC_BACKEND_URL
  const fromPayload = process.env.PAYLOAD_API_URL?.replace(/\/api$/, "")
  return fromPublic || fromPayload
}

export async function GET(req: NextRequest, context: any) {
  const path = context.params?.path || []

  const base = getBackendBase()
  if (!base) {
    return NextResponse.json(
      { ok: false, error: "BACKEND_URL not configured" },
      { status: 500 }
    )
  }

  const joined = path.join("/")
  const search = req.nextUrl.search || ""
  const targetUrl = `${base}/api/${joined}${search}`

  try {
    const upstream = await fetch(targetUrl, { cache: "no-store" })
    const text = await upstream.text()

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") || "application/json"
      }
    })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Proxy request failed" },
      { status: 500 }
    )
  }
}
