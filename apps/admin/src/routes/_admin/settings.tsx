import {
  IconApps,
  IconArrowUp,
  IconBook,
  IconBrandDiscord,
  IconBuilding,
  IconDownload,
  IconFileText,
  IconGlobe,
  IconMessageCircle,
  IconMoodSmile,
  IconPalette,
  IconProgress,
  IconShield,
  IconTags,
  IconUser,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { SiteHeader } from '@/components/site-header';

type NavItem = {
  key: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
};
type NavGroup = { title: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    title: 'General',
    items: [
      { key: 'team-members', label: 'Team Members', icon: IconUsers },
      { key: 'pricing', label: 'Pricing Plan', icon: IconArrowUp },
    ],
  },
  {
    title: 'Branding & Customizations',
    items: [
      { key: 'branding', label: 'Branding', icon: IconPalette },
      {
        key: 'notification-emails',
        label: 'Notification Emails',
        icon: IconMessageCircle,
      },
      { key: 'modules', label: 'Customize/disable modules', icon: IconApps },
      { key: 'custom-domains', label: 'Custom Domains', icon: IconGlobe },
    ],
  },
  {
    title: 'Access & Authentication',
    items: [
      { key: 'org-access', label: 'Organization Access', icon: IconBuilding },
      { key: 'auth-security', label: 'Auth & security', icon: IconShield },
    ],
  },
  {
    title: 'Modules',
    items: [
      { key: 'support', label: 'Support', icon: IconMoodSmile },
      { key: 'boards', label: 'Feedback & Roadmap', icon: IconMessageCircle },
      { key: 'changelog', label: 'Changelog', icon: IconFileText },
      { key: 'help-center', label: 'Help Center', icon: IconBook },
    ],
  },
  {
    title: 'User data',
    items: [
      { key: 'user-tags', label: 'User Tags', icon: IconTags },
      { key: 'banned-users', label: 'Banned Users', icon: IconUser },
    ],
  },
  {
    title: 'Other',
    items: [
      { key: 'widgets', label: 'Widgets & Embeds', icon: IconApps },
      { key: 'integrations', label: 'Integrations', icon: IconDownload },
      { key: 'advanced', label: 'Advanced', icon: IconProgress },
      { key: 'danger-zone', label: 'Danger Zone', icon: IconX },
    ],
  },
  {
    title: 'Resources',
    items: [
      { key: 'docs', label: 'Visit Developer Docs', icon: IconBook },
      {
        key: 'discord',
        label: 'Join our Discord community',
        icon: IconBrandDiscord,
      },
    ],
  },
];

export const Route = createFileRoute('/_admin/settings')({
  beforeLoad: ({ location }) => {
    // Redirect bare /settings to default child route
    if (
      location.pathname === '/settings' ||
      location.pathname === '/settings/'
    ) {
      throw redirect({ to: '/settings/pricing', replace: true });
    }
  },
  component: SettingsLayout,
});

function SettingsLayout() {
  return (
    <div className='h-svh overflow-hidden lg:p-2'>
      <div className='flex h-full flex-col items-center justify-start overflow-hidden bg-container lg:rounded-md lg:border'>
        <SiteHeader title='Settings' />

        <div className='min-h-[calc(100svh-80px)] w-full overflow-auto p-6 lg:min-h-[calc(100svh-96px)]'>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
