import { createFileRoute, Navigate, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/')({
  component: LandingComponent,
  head: () => ({
    meta: [
      {
        title: 'Open Feedback - Complete Customer Feedback Platform',
      },
      {
        name: 'description',
        content:
          'Collect, organize, and act on customer feedback with Open Feedback. A powerful alternative to Canny, UserJot, and Productboard with customizable workflows, multi-tenant support, and AI-powered insights.',
      },
      {
        name: 'keywords',
        content:
          'customer feedback, feedback management, canny alternative, productboard alternative, feature requests, bug tracking, product management, user feedback, roadmap, changelog, feedback widget, customer insights',
      },
      {
        name: 'author',
        content: 'Open Feedback',
      },
      {
        name: 'robots',
        content: 'index, follow',
      },
      {
        property: 'og:title',
        content: 'Open Feedback - Complete Customer Feedback Platform',
      },
      {
        property: 'og:description',
        content:
          'Transform how you collect and manage customer feedback. Open Feedback offers advanced features, customizable workflows, and seamless integrations for modern product teams.',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:site_name',
        content: 'Open Feedback',
      },
      {
        property: 'og:image',
        content: 'https://openfeedback.tech/og-image.png',
      },
      {
        property: 'og:image:width',
        content: '1200',
      },
      {
        property: 'og:image:height',
        content: '630',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:site',
        content: '@openfeedback',
      },
      {
        name: 'twitter:creator',
        content: '@openfeedback',
      },
      {
        name: 'twitter:title',
        content: 'Open Feedback - Complete Customer Feedback Platform',
      },
      {
        name: 'twitter:description',
        content:
          'Transform how you collect and manage customer feedback. Advanced features, customizable workflows, and seamless integrations for modern product teams.',
      },
      {
        name: 'twitter:image',
        content: 'https://openfeedback.tech/twitter-image.png',
      },
      {
        name: 'theme-color',
        content: '#0ea5e9',
      },
      {
        name: 'msapplication-TileColor',
        content: '#0ea5e9',
      },
      {
        name: 'application-name',
        content: 'Open Feedback',
      },
      {
        name: 'apple-mobile-web-app-title',
        content: 'Open Feedback',
      },
      {
        name: 'apple-mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'default',
      },
    ],
  }),
});

function LandingComponent() {
  return <Navigate replace search={{} as any} to="/boards" />;
}
