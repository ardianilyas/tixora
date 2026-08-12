import z from "zod";

export const createCommentDto = z.object({
  body: z.string().min(1, "Body is required"),
  ticketId: z.string(),
});

export type CreateCommentDto = z.infer<typeof createCommentDto>;
