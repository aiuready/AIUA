import type { School } from "@prisma/client";
import {
  Sparkles,
  Briefcase,
  PenTool,
  Rocket,
  Award,
  Code2,
  Globe2,
  Users,
  type LucideIcon,
} from "lucide-react";

export const SCHOOL_ICONS: Record<School, LucideIcon> = {
  FOUNDATIONS: Sparkles,
  BUSINESS: Briefcase,
  CONTENT: PenTool,
  CAREERS: Rocket,
  PROFESSIONALS: Award,
  BUILDERS: Code2,
  AFRICAN_AI: Globe2,
  INSTRUCTOR_TRACK: Users,
};
