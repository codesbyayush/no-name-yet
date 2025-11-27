import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

export interface InvitationEmailProps {
  inviteeName?: string;
  inviterName: string;
  inviterEmail: string;
  organizationName: string;
  teamName?: string;
  role: string;
  inviteLink: string;
  expiresInDays?: number;
}

export const InvitationEmail = ({
  inviteeName,
  inviterName,
  inviterEmail,
  organizationName,
  teamName,
  role,
  inviteLink,
  expiresInDays = 7,
}: InvitationEmailProps) => (
  <Html>
    <Head />
    <Preview>
      {inviterName} invited you to join {organizationName} on OpenFeedback
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Heading style={heading}>You're Invited! 🎉</Heading>

          {inviteeName ? (
            <Text style={paragraph}>Hi {inviteeName},</Text>
          ) : (
            <Text style={paragraph}>Hello,</Text>
          )}

          <Text style={paragraph}>
            <strong>{inviterName}</strong> ({inviterEmail}) has invited you to
            join <strong>{organizationName}</strong> on OpenFeedback
            {teamName && (
              <>
                {' '}
                as part of the <strong>{teamName}</strong> team
              </>
            )}
            .
          </Text>

          <Text style={paragraph}>
            You'll be joining as a{' '}
            <span style={roleTag}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </span>
            .
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={inviteLink}>
              Accept Invitation
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footerText}>
            This invitation will expire in {expiresInDays} days. If you didn't
            expect this invitation, you can safely ignore this email.
          </Text>

          <Text style={footerText}>
            If the button doesn't work, copy and paste this link into your
            browser:
          </Text>
          <Text style={linkText}>{inviteLink}</Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#0a0a0b',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: '#18181b',
  margin: '40px auto',
  padding: '20px 0 48px',
  borderRadius: '12px',
  maxWidth: '560px',
  border: '1px solid #27272a',
};

const box = {
  padding: '0 40px',
};

const heading = {
  color: '#fafafa',
  fontSize: '28px',
  fontWeight: '700',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const paragraph = {
  color: '#a1a1aa',
  fontSize: '16px',
  lineHeight: '26px',
  textAlign: 'left' as const,
};

const roleTag = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '14px',
  fontWeight: '500',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const hr = {
  borderColor: '#27272a',
  margin: '32px 0',
};

const footerText = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'left' as const,
  margin: '8px 0',
};

const linkText = {
  color: '#3b82f6',
  fontSize: '12px',
  lineHeight: '20px',
  wordBreak: 'break-all' as const,
};
