// Better Auth server config — email/password auth with Turso database
// Tables (user, session, account, verification) are auto-created by Better Auth
import { betterAuth } from "better-auth";
import { turso } from "./db";

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
  secret: process.env.BETTER_AUTH_SECRET,
  database: {
    type: "sqlite",
    db: turso,
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes — avoids DB lookup on every request
    },
  },
});
