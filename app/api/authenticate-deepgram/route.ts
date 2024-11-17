// write a route to return the deepgram api key
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ key: process.env.DEEPGRAM_API_KEY });
}
