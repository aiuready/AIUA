import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "node:fs/promises";
import path from "node:path";

// DigitalOcean Spaces (S3-compatible) per TRD §1.2/§4.2. Falls back to
// writing under public/uploads in dev when Spaces credentials aren't set,
// so certificate/receipt generation is fully testable without real
// storage creds. Never used once STORAGE_* env vars are present.
const hasRealStorage = Boolean(
  process.env.STORAGE_ENDPOINT &&
    process.env.STORAGE_KEY &&
    process.env.STORAGE_SECRET &&
    process.env.STORAGE_BUCKET
);

let client: S3Client | null = null;
function getClient(): S3Client {
  if (!client) {
    client = new S3Client({
      endpoint: process.env.STORAGE_ENDPOINT,
      region: process.env.STORAGE_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.STORAGE_KEY!,
        secretAccessKey: process.env.STORAGE_SECRET!,
      },
    });
  }
  return client;
}

export async function uploadFile(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  if (hasRealStorage) {
    try {
      const s3 = getClient();
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.STORAGE_BUCKET!,
          Key: key,
          Body: body,
          ContentType: contentType,
          ACL: "public-read",
        })
      );
      return `${process.env.STORAGE_ENDPOINT}/${process.env.STORAGE_BUCKET}/${key}`;
    } catch (err) {
      // Never let a storage misconfiguration take down checkout/certificate
      // issuance outright (Webflow §8: "never a blank page on failure") -
      // fall through to the local write below and surface the error in logs.
      console.error("uploadFile: Spaces upload failed, falling back to local disk:", err);
    }
  }

  const filePath = path.join(process.cwd(), "public", "uploads", key);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, body);
  return `/uploads/${key}`;
}
