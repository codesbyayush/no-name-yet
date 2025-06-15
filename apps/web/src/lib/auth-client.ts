import { createAuthClient } from "better-auth/react";
import { adminClient, organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_SERVER_URL || "https://localhost:8080",
  plugins: [adminClient(), organizationClient()],
  fetchOptions: {
    credentials: "include",
    // headers: {
    //   "Content-Type": "application/json",
    // },
    onError: async (context) => {
      const { response } = context;
      if (response.status === 401) {
        console.log("Authentication required");
      } else if (response.status === 403) {
        console.log("Access forbidden");
      } else if (response.status >= 400) {
        console.error("Request failed:", response.status, response.statusText);
      }
    },
  },
});

export const {
  useSession,
  signIn,
  signUp,
  signOut,
  forgetPassword,
  resetPassword,
} = authClient;

export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
