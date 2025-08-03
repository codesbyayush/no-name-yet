import { createFileRoute, redirect } from "@tanstack/react-router";
import LandingPage from "../components/landing";

export const Route = createFileRoute("/")({
  component: LandingComponent,
  head: () => ({
    meta: [
      {
        title: "OmniFeedback - Complete Customer Feedback Platform",
      },
      {
        name: "description",
        content:
          "Collect, organize, and act on customer feedback with OmniFeedback. A powerful alternative to Canny, UserJot, and Productboard with customizable workflows, multi-tenant support, and AI-powered insights.",
      },
      {
        name: "keywords",
        content:
          "customer feedback, feedback management, canny alternative, productboard alternative, feature requests, bug tracking, product management, user feedback, roadmap, changelog, feedback widget, customer insights",
      },
      {
        name: "author",
        content: "OmniFeedback",
      },
      {
        name: "robots",
        content: "index, follow",
      },
      {
        property: "og:title",
        content: "OmniFeedback - Complete Customer Feedback Platform",
      },
      {
        property: "og:description",
        content:
          "Transform how you collect and manage customer feedback. OmniFeedback offers advanced features, customizable workflows, and seamless integrations for modern product teams.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:site_name",
        content: "OmniFeedback",
      },
      {
        property: "og:image",
        content: "https://omnifeedback.app/og-image.png",
      },
      {
        property: "og:image:width",
        content: "1200",
      },
      {
        property: "og:image:height",
        content: "630",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:site",
        content: "@omnifeedback",
      },
      {
        name: "twitter:creator",
        content: "@omnifeedback",
      },
      {
        name: "twitter:title",
        content: "OmniFeedback - Complete Customer Feedback Platform",
      },
      {
        name: "twitter:description",
        content:
          "Transform how you collect and manage customer feedback. Advanced features, customizable workflows, and seamless integrations for modern product teams.",
      },
      {
        name: "twitter:image",
        content: "https://omnifeedback.app/twitter-image.png",
      },
      {
        name: "theme-color",
        content: "#0ea5e9",
      },
      {
        name: "msapplication-TileColor",
        content: "#0ea5e9",
      },
      {
        name: "application-name",
        content: "OmniFeedback",
      },
      {
        name: "apple-mobile-web-app-title",
        content: "OmniFeedback",
      },
      {
        name: "apple-mobile-web-app-capable",
        content: "yes",
      },
      {
        name: "apple-mobile-web-app-status-bar-style",
        content: "default",
      },
    ],
  }),
  beforeLoad: () => {
    const host = window.location.host;
    const hostParts = host.split(".");

    // If on a subdomain (not localhost, not app), redirect to board
    if (
      hostParts.length > 1 &&
      hostParts[0] !== "localhost" &&
      hostParts[0] !== "app"
    ) {
      window.location.href = `https://${window.location.host}/board`;
      return;
    }

    // If on main domain or app subdomain, redirect to app.domain.com
    // This ensures users always land on app.domain.com for the main app
    if (hostParts[0] !== "app" && !host.includes("localhost")) {
      // In production, redirect to app subdomain
      // For development, we'll just continue to the landing page
      window.location.href = `https://app.${hostParts.slice(1).join(".")}`;
      return;
    }
  },
});

function LandingComponent() {
  return <LandingPage />;
}
