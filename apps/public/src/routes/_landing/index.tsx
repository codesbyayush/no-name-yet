import { createFileRoute } from "@tanstack/react-router";
import LandingPage from "../../components/landing";

export const Route = createFileRoute("/_landing/")({
  component: () => <LandingPage />,
});
