import { SiteFooter } from "@/components/site-footer";

// Marketing/public pages get the footer; logged-in app screens
// ((student)/(instructor)/(admin)) stay lean and task-focused.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SiteFooter />
    </>
  );
}
