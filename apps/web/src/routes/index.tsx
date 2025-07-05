import { createFileRoute, redirect } from "@tanstack/react-router";
import LandingPage from "../components/landing";

export const Route = createFileRoute("/")({
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
	beforeLoad: () => {
		const host = window.location.host;
		const hostParts = host.split(".");

		// If on a subdomain (not localhost, not app), redirect to board
		if (
			hostParts.length > 1 &&
			hostParts[0] !== "localhost" &&
			hostParts[0] !== "app"
		) {
			throw redirect({
				to: "/board",
			});
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
