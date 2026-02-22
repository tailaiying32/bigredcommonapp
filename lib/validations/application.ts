import { z } from "zod";
import type { TeamQuestion } from "@/types/database";

export function buildApplicationSchema(questions: TeamQuestion[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const q of questions) {
    let field: z.ZodTypeAny;

    if (q.type === "select") {
      field = z.string();
    } else {
      field = z.string();
    }

    if (q.required) {
      field = field.pipe(z.string().min(1, `"${q.label}" is required`));
    } else {
      field = field.optional().or(z.literal(""));
    }

    shape[q.id] = field;
  }

  return z.object(shape);
}
