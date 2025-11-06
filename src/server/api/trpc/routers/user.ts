import { deleteUser, updateUser } from "@/server/services/user-service";
import { updateUserSchema } from "@/shared/validators/user.schema";
import { createTRPCRouter, protectedProcedure } from "../init";
import { user } from "@/server/db/schema/auth-schema";
import { eq } from "drizzle-orm";

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx: { session } }) => {
    return session.user;
  }),

  list: protectedProcedure.query(async ({ ctx: { db } }) => {
    return await db.select({ id: user.id, name: user.name, email: user.email }).from(user);
  }),

  update: protectedProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx: { headers }, input }) => {
      return await updateUser(headers, input);
    }),

  delete: protectedProcedure.mutation(async ({ ctx: { headers } }) => {
    return await deleteUser(headers);
  }),
});
