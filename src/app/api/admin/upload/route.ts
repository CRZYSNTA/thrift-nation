import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-guards";
import { getCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    await requireAdminSession();
  } catch (err) {
    const code = err instanceof Error && err.message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ error: "Admin access required" }, { status: code });
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      {
        error:
          "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET or paste a direct image URL.",
      },
      { status: 503 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`;

    const cloudinary = getCloudinary();
    const uploaded = await cloudinary.uploader.upload(base64, {
      folder: "thrift-nation/products",
      resource_type: "image",
    });

    return NextResponse.json({ url: uploaded.secure_url });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return NextResponse.json(
      { error: "Image upload failed" },
      { status: 500 }
    );
  }
}

