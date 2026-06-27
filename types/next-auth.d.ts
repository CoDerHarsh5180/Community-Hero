// types/next-auth.d.ts

import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's unique database ID. */
      id: string;
      role?: string; // Adding this here in case you want to pass the user's role into the session later!
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** The user's unique database ID. */
    id: string;
    role?: string;
  }
}