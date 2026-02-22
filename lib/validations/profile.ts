import { z } from "zod";

export const profileSchema = z.object({
  netid: z
    .string()
    .regex(/^[a-z]{2,3}[0-9]{1,4}$/, "Invalid Cornell NetID format"),
  email: z
    .string()
    .email("Invalid email address")
    .refine((email) => email.endsWith("@cornell.edu"), {
      message: "Must be a @cornell.edu email",
    }),
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  major: z.string().optional(),
  grad_year: z
    .number()
    .int()
    .min(2020, "Graduation year must be 2020 or later")
    .max(2035, "Graduation year must be 2035 or earlier")
    .optional(),
  gpa: z
    .number()
    .min(0, "GPA must be at least 0")
    .max(4.3, "GPA must be at most 4.3")
    .optional(),
  resume_url: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
