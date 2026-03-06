import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const booking = await req.json();
  console.log("[Booking Request]", JSON.stringify(booking, null, 2));
  return NextResponse.json({ success: true });
}
