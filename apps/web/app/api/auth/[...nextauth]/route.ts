import NextAuth, { type AuthOptions } from 'next-auth';
import type { DefaultSession } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import KeycloakProvider from 'next-auth/providers/keycloak';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    provider?: string;
    acr?: string;
    roles?: string[];
    accessToken?: string;
    error?: string;
    maxAge?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    provider?: string;
    acr?: string;
    roles?: string[];
    accessToken?: string;
    refreshToken?: string;
    idToken?: string; // Add id_token for logout
    accessTokenExpires?: number; // epoch ms
    error?: string;
  }
}

// Helper to refresh Keycloak access token using the refresh token
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    if (!token.refreshToken) {
      return { ...token, error: 'NoRefreshToken' };
    }

    const issuer = process.env.KEYCLOAK_ISSUER;
    if (!issuer) {
      return { ...token, error: 'MissingIssuer' };
    }
    const tokenEndpoint = `${issuer.replace(/\/$/, '')}/protocol/openid-connect/token`;

    const res = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      cache: 'no-store',
      body: new URLSearchParams({
        client_id: process.env.KEYCLOAK_CLIENT_ID || '',
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET || '',
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
      }),
    });

    interface RefreshResponse {
      access_token: string;
      refresh_token?: string;
      expires_in: number; // seconds
      [k: string]: unknown;
    }
    const refreshed = (await res.json()) as RefreshResponse;
    if (!res.ok) {
      return { ...token, error: 'RefreshAccessTokenError' };
    }

    return {
      ...token,
      accessToken: refreshed.access_token as string,
      accessTokenExpires: Date.now() + (refreshed.expires_in as number) * 1000,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      // Preserve idToken during refresh as it doesn't change
      idToken: token.idToken,
      error: undefined,
    };
  } catch {
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!, // http://localhost:8080/realms/Olinnwan
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, account, profile }) {
      // Initial sign in
      if (account) {
        token.provider = account.provider;

        // Access / refresh tokens from Keycloak
        interface KeycloakAccount {
          access_token?: string;
          refresh_token?: string;
          id_token?: string; // Add id_token
          expires_at?: number; // epoch seconds
          [k: string]: unknown;
        }
        const kc = account as unknown as KeycloakAccount;
        token.accessToken = kc.access_token;
        token.refreshToken = kc.refresh_token;
        token.idToken = kc.id_token; // Store id_token for logout
        // Keycloak usually gives expires_at (seconds). Fallback to 5 min.
        const expiresAt = kc.expires_at;
        token.accessTokenExpires = expiresAt
          ? (expiresAt as number) * 1000
          : Date.now() + 5 * 60 * 1000;

        if (profile && typeof profile === 'object') {
          if ('acr' in profile) {
            token.acr = String((profile as Record<string, unknown>).acr);
          }
          // Extract roles: realm_access.roles or resource_access
          interface KeycloakProfile {
            realm_access?: { roles?: string[] };
            [k: string]: unknown;
          }
          const p = profile as unknown as KeycloakProfile;
          const realmRoles: string[] | undefined = p.realm_access?.roles;
          token.roles = realmRoles || [];
        }
      }

      // Return previous token if access token not expired yet
      if (
        token.accessToken &&
        token.accessTokenExpires &&
        Date.now() < token.accessTokenExpires - 10 * 1000
      ) {
        return token;
      }

      // Attempt to refresh
      if (token.refreshToken) {
        return await refreshAccessToken(token);
      }

      return token; // No refresh token available
    },
    async session({ session, token }) {
      session.provider = token.provider;
      session.acr = token.acr;
      session.roles = token.roles;
      session.accessToken = token.accessToken;
      session.error = token.error;
      session.maxAge = 60 * 30;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allow relative URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      try {
        const target = new URL(url);
        if (target.origin === baseUrl) return url;
      } catch {
        /* ignore parse errors */
      }
      return baseUrl;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
