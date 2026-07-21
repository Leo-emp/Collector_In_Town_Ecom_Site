// Better Auth catch-all API route — handles sign in, sign up, sign out, session
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
