import { render } from '@react-email/render';
import { createElement } from 'react';
import { Resend } from 'resend';
import type { AppEnv } from '@/lib/env';
import {
  InvitationEmail,
  type InvitationEmailProps,
} from './templates/invitation-email';
import { WelcomeEmail } from './templates/welcome-email';

// Type for welcome email props
interface WelcomeEmailProps {
  firstname?: string;
}

type EmailType = 'welcome' | 'invitation';
type EmailProps<T extends EmailType> = T extends 'welcome'
  ? WelcomeEmailProps | undefined
  : InvitationEmailProps;

export async function sendEmail<T extends EmailType>(
  env: AppEnv,
  to: string,
  type: T,
  props: EmailProps<T>,
): Promise<ReturnType<Resend['emails']['send']>> {
  const resend = new Resend(env.RESEND_DOMAIN_KEY);

  let emailSubject: string;
  let html: string;

  if (type === 'welcome') {
    emailSubject = 'How was your onboarding to OpenFeedback?';
    html = await render(
      createElement(WelcomeEmail, {
        firstname: (props as WelcomeEmailProps | undefined)?.firstname,
      }),
    );
  } else {
    const inviteProps = props as InvitationEmailProps;
    emailSubject = `${inviteProps.inviterName} invited you to join ${inviteProps.organizationName}`;
    html = await render(createElement(InvitationEmail, inviteProps));
  }

  return resend.emails.send({
    from:
      type === 'welcome'
        ? 'Ayush <ayush@openfeedback.tech>'
        : 'OpenFeedback <invitations@openfeedback.tech>',
    to,
    subject: emailSubject,
    html,
  });
}

// Convenience function specifically for invitation emails
export async function sendInvitationEmail(
  env: AppEnv,
  to: string,
  props: InvitationEmailProps,
) {
  return sendEmail(env, to, 'invitation', props);
}
