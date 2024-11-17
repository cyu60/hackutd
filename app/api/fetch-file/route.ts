import { getFileUrl } from "@/lib/config";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { cid } = await req.json();
    console.log("Received CID:", cid);

    if (!cid || typeof cid !== "string") {
      console.error("Invalid CID:", cid);
      return NextResponse.json({ error: "CID is required" }, { status: 400 });
    }

    const response = await fetch(getFileUrl(cid));
    // const response = await fetch(
    //   `${process.env.NEXT_PUBLIC_GATEWAY_URL}/files/${cid}`
    // );
    console.log("Fetch response status:", response.status);

    if (!response.ok) {
      throw new Error("Failed to fetch file");
    }

    const contentType = response.headers.get("content-type");
    const data = await response.arrayBuffer();

    console.log("Fetched data size:", data.byteLength);
    return NextResponse.json({ data, contentType }, { status: 200 });
  } catch (error) {
    console.error("Error fetching file:", error);
    return NextResponse.json(
      { error: "Failed to fetch file" },
      { status: 500 }
    );
  }
}
