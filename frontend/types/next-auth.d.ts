import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      traderLevel?: string;
    } & DefaultSession["user"];
  }

  interface User {
    traderLevel?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    traderLevel?: string;
  }
}