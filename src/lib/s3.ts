"use server";
import { S3Client, DeleteObjectCommand, PutObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

if (!process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_KEY || !process.env.S3_ENDPOINT) {
  throw new Error("Missing Liara S3 environment variables");
}

const s3 = new S3Client({
  region: "default",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
});

export const generateUploadUrl = async ({ key, contentType }: { key: string; contentType: string }) => {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3, command, {
    expiresIn: 60 * 5,
  });

  return {
    url,
    key,
  };
};

export const removeImage = async (url: string | string[]) => {
  const Bucket = process.env.S3_BUCKET_NAME!;
  try {
    if (typeof url === "string") {
      await s3.send(
        new DeleteObjectCommand({
          Bucket,
          Key: url.replace(/^https?:\/\/[^/]+\/?/, ""),
        }),
      );
    } else {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket,
          Delete: {
            Objects: url.map((e) => ({ Key: e.replace(/^https?:\/\/[^/]+\/?/, "") })),
          },
        }),
      );
    }

    return {
      message: "فایل با موفقیت حذف شد",
      status: 200,
    };
  } catch {
    return {
      message: "خطا در حذف عکس",
      status: 500,
    };
  }
};
