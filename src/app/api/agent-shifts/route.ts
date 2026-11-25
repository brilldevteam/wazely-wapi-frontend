import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authoption } from "../auth/[...nextauth]/authOption";

const API = process.env.NEXT_PUBLIC_API_URL;
const request = async (method: string, body?: unknown) => {
  const session = await getServerSession(authoption);
  const response = await fetch(`${API}/agent-shifts`, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.accessToken || ""}` }, body: body ? JSON.stringify(body) : undefined, cache: "no-store" });
  return NextResponse.json(await response.json(), { status: response.status });
};
export async function GET() { return request("GET"); }
export async function POST(req: NextRequest) { return request("POST", await req.json()); }
