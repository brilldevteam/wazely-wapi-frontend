import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authoption } from "../auth/[...nextauth]/authOption";

const API = process.env.NEXT_PUBLIC_API_URL;
const jsonResponse = async (response: Response) => {
  const text = await response.text();
  let payload: unknown;
  try { payload = text ? JSON.parse(text) : { success: response.ok }; }
  catch { payload = { success: false, message: text || "The API returned an invalid response" }; }
  return NextResponse.json(payload, { status: response.status });
};
const request = async (method: string, body?: unknown) => {
  try {
    const session = await getServerSession(authoption);
    const response = await fetch(`${API}/agent-shifts`, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.accessToken || ""}` }, body: body ? JSON.stringify(body) : undefined, cache: "no-store" });
    return jsonResponse(response);
  } catch { return NextResponse.json({ success: false, message: "Could not connect to the API" }, { status: 502 }); }
};
export async function GET() { return request("GET"); }
export async function POST(req: NextRequest) { return request("POST", await req.json()); }
