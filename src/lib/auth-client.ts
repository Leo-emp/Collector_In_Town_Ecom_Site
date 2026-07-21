// Better Auth client — used in React client components
// Provides signIn, signUp, signOut, useSession
"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();
