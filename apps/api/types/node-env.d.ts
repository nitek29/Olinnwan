declare namespace NodeJS {
  interface ProcessEnv {
    KEYCLOAK_CLIENT_ID: string;
    KEYCLOAK_CLIENT_SECRET: string;
    KEYCLOAK_ISSUER: string;
    NEXTAUTH_SECRET: string;
  }
}
