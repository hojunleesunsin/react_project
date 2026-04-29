import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      loginId: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    error?: "RefreshTokenExpired";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    loginId?: string;
    accessTokenExpires?: number;
    refreshTokenExpires?: number;
    error?: "RefreshTokenExpired";
  }
}
