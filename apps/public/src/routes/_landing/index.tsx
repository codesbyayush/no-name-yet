import { createFileRoute } from '@tanstack/react-router';
import { HeroHeader } from '@/components/landing/header';
import HeroSection from '@/components/landing/hero-section';

export const Route = createFileRoute('/_landing/')({
  component: () => <LandingPage />,
});

const LandingPage = () => {
  return (
    <>
      <HeroSection />
    </>
  );
};
