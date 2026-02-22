import { z } from "zod";

export const messageSchema = z.object({
  applicationId: z.string().uuid(),
  body: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message cannot exceed 2000 characters"),
});
