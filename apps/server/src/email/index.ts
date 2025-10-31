import { render } from '@react-email/render';
import { createElement } from 'react';
import { Resend } from 'resend';
import type { AppEnv } from '@/lib/env';
import { WelcomeEmail } from './templates/welcome-email';

const templates = {
  welcome: {
    subject: 'How was your onboarding to OpenFeedback?',
    from: 'Ayush <ayush@openfeedback.tech>',
    ReactEmail: WelcomeEmail,
  },
};

export const sendEmail = async (
  env: AppEnv,
  to: string,
  type: keyof typeof templates,
  name?: string,
) => {
  const resend = new Resend(env.RESEND_DOMAIN_KEY);
  const { from, subject, ReactEmail } = templates[type];
  return resend.emails.send({
    from,
    to,
    subject,
    html: await render(createElement(ReactEmail, { firstname: name })),
  });
};
