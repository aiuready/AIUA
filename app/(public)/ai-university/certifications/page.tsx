import { ShieldCheck } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata = { title: "Certifications" };

const LEVELS = [
  { level: "AI Practitioner", requirement: "Complete School 1 (Foundations)", signals: "Everyday, responsible AI user" },
  { level: "AI Specialist", requirement: "Complete one applied school (Business, Content, Professional, or African AI)", signals: "Applied AI skill in a domain" },
  { level: "AI Professional", requirement: "Complete AI Careers track + one Specialist certification", signals: "Job-ready, portfolio-verified" },
  { level: "AI Consultant", requirement: "Complete AI Builders track + a deployed capstone project", signals: "Can design and deploy AI solutions for others" },
  { level: "AI Instructor", requirement: "Complete School 8 practicum", signals: "Certified to teach AIUA curriculum" },
  { level: "AI Fellow", requirement: "Sustained contribution: teaching, mentorship, or community leadership", signals: "Recognized institutional leader" },
];

export default function CertificationsPage() {
  return (
    <main>
      <Section className="pt-14 sm:pt-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            AI University
          </span>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            The Certification Pathway
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            A visible progression ladder, not a single completion
            certificate — a reason to keep advancing, and a clear signal to
            employers of exactly what level you&rsquo;re at.
          </p>
        </div>
      </Section>

      <Section muted>
        <SectionHeading eyebrow="Six levels" title="From first-time user to institutional leader" center={false} />
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-card">
                <th className="px-5 py-3 font-semibold text-foreground">Level</th>
                <th className="px-5 py-3 font-semibold text-foreground">Requirement</th>
                <th className="px-5 py-3 font-semibold text-foreground">Signals to employers</th>
              </tr>
            </thead>
            <tbody>
              {LEVELS.map((row) => (
                <tr key={row.level} className="border-b border-border last:border-0">
                  <td className="whitespace-nowrap px-5 py-3 font-medium text-foreground">{row.level}</td>
                  <td className="px-5 py-3 text-muted-foreground">{row.requirement}</td>
                  <td className="px-5 py-3 text-muted-foreground">{row.signals}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section>
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck size={24} />
          </span>
          <h2 className="font-heading text-xl font-bold text-foreground">
            Every certification carries a public verification ID
          </h2>
          <p className="text-sm text-muted-foreground">
            An employer can check any AIUA certificate on our public
            verification page — no login, no account, just an instant
            valid/revoked answer. That&rsquo;s the trust signal a &ldquo;certificate
            without a job&rdquo; skeptic actually needs to see.
          </p>
          <ButtonLink href="/verify">Verify a certificate</ButtonLink>
        </div>
      </Section>
    </main>
  );
}
