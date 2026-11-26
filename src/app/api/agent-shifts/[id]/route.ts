import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authoption } from "../../auth/[...nextauth]/authOption";

const API = process.env.NEXT_PUBLIC_API_URL;
const jsonResponse = async (response: Response) => {
  const text = await response.text();
  let payload: unknown;
  try { payload = text ? JSON.parse(text) : { success: response.ok }; }
  catch { payload = { success: false, message: text || "The API returned an invalid response" }; }
  return NextResponse.json(payload, { status: response.status });
};
const forward = async (method: string, id: string, body?: unknown) => {
  try {
    const session = await getServerSession(authoption);
    const response = await fetch(`${API}/agent-shifts/${id}`, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.accessToken || ""}` }, body: body ? JSON.stringify(body) : undefined, cache: "no-store" });
    return jsonResponse(response);
  } catch { return NextResponse.json({ success: false, message: "Could not connect to the API" }, { status: 502 }); }
};
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) { return forward("GET", (await params).id); }
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) { return forward("PUT", (await params).id, await req.json()); }
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) { return forward("DELETE", (await params).id); }
