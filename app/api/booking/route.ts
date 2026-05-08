import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: "Booking API" });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: "Create booking" });
}
