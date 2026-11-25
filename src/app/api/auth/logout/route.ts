import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authoption } from "../[...nextauth]/authOption";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Ends the login session on the API server, so the token stops working everywhere
 * (API calls and the live socket). Called by performLogout() before the browser
 * session cookie is cleared. Always answers 200: logout must never get stuck here.
 */
export async function POST() {
  try {
    const session = await getServerSession(authoption);
    const token = session?.accessToken as string | undefined;

    if (!token) {
      return NextResponse.json({ success: true, message: "No active session" }, { status: 200 });
    }

    const response = await fetch(`${BACKEND_API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(5000),
    });

    // 401/404 mean the session was already gone, which is fine for a logout.
    return NextResponse.json({ success: true, serverStatus: response.status }, { status: 200 });
  } catch (error: unknown) {
    console.error("Logout API error:", error);
    return NextResponse.json({ success: true, serverStatus: "unreachable" }, { status: 200 });
  }
}
