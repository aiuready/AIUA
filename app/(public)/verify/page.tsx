import { PagePlaceholder } from "@/components/page-placeholder";

// Public, no-login certificate verification. Single verificationId input ->
// GET /api/certificates/verify -> VALID / REVOKED / NOT FOUND.
// See docs/WEBFLOW.md §3.4 and docs/DATABASE_SCHEMA.md §3.6.
export default function VerifyPage() {
  return (
    <PagePlaceholder
      title="Verify a certificate"
      route="/verify"
      access="Public"
      note="No-login certificate ID lookup. See docs/WEBFLOW.md §3.4."
    />
  );
}
