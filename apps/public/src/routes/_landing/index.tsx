import { HeroHeader } from "@/components/landing/header";
import HeroSection from "@/components/landing/hero-section";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_landing/")({
	component: () => <LandingPage />,
});

const LandingPage = () => {
	return (
		<>
			<HeroSection />
		</>
	);
};
