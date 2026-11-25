import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authoption } from "../[...nextauth]/authOption";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL;

/** The logged-in user's Available / Away status (used by auto-assignment). */
const forward = async (method: "GET" | "PUT", body?: unknown) => {
  const session = await getServerSession(authoption);
  const token = session?.accessToken as string | undefined;
  if (!token) {
    return NextResponse.json({ success: false, message: "Session expired or logged out. Please log in again." }, { status: 401 });
  }

  const response = await fetch(`${BACKEND_API_URL}/auth/availability`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
};

export async function GET() {
  try {
    return await forward("GET");
  } catch (error: unknown) {
    console.error("Availability API error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    return await forward("PUT", body);
  } catch (error: unknown) {
    console.error("Availability API error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
