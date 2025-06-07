import { createFileRoute } from "@tanstack/react-router";
import LandingPage from "../components/landing";

export const Route = createFileRoute("/landing")({
  component: LandingComponent,
  head: () => ({
    meta: [
      {
        title: "Better T-App - Modern Productivity Platform",
      },
      {
        name: "description",
        content:
          "Experience the next generation of productivity tools with our modern, intuitive platform designed for the future.",
      },
      {
        name: "keywords",
        content:
          "productivity, modern, platform, collaboration, enterprise, secure, fast",
      },
      {
        property: "og:title",
        content: "Better T-App - Modern Productivity Platform",
      },
      {
        property: "og:description",
        content:
          "Experience the next generation of productivity tools with our modern, intuitive platform designed for the future.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: "Better T-App - Modern Productivity Platform",
      },
      {
        name: "twitter:description",
        content:
          "Experience the next generation of productivity tools with our modern, intuitive platform designed for the future.",
      },
    ],
  }),
});

function LandingComponent() {
  return <LandingPage />;
}
