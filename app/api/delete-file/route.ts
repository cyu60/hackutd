import { NextRequest } from "next/server";
import { pinata } from "@/lib/config";
import { NextResponse } from "next/server";

// Delete example
// const deletedFiles = await pinata.files.delete([
//     "4ad9d3d1-4ab4-464c-a42a-3027fc39a546"
//   ])

export async function POST(req: NextRequest) {
  const { fileId } = await req.json();
  const deletedFiles = await pinata.files.delete([fileId]);
  return NextResponse.json(deletedFiles, { status: 200 });
}
