import { createFileRoute } from '@tanstack/react-router';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Skeleton } from '@workspace/ui/components/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { Textarea } from '@workspace/ui/components/textarea';
import { MoreHorizontal } from 'lucide-react';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useUsers as useAdminUsers } from '@/hooks/use-users';
import { authClient } from '@/lib/auth-client';

// Helpers to reduce complexity in effects/handlers
async function resolveOrganizationId(existingOrgId?: string) {
  if (existingOrgId) {
    return existingOrgId;
  }
  const { data: orgs } = await authClient.organization.list();
  return orgs?.[0]?.id as string | undefined;
}

type NormalizedInvitation = {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string | Date;
};

function normalizeInvitations(input: unknown): NormalizedInvitation[] {
  if (Array.isArray(input)) {
    return input as NormalizedInvitation[];
  }
  if (
    input &&
    typeof input === 'object' &&
    'response' in (input as Record<string, unknown>) &&
    Array.isArray((input as { response?: unknown }).response)
  ) {
    return (input as { response: NormalizedInvitation[] }).response;
  }
  if (
    input &&
    typeof input === 'object' &&
    'invitations' in (input as Record<string, unknown>) &&
    Array.isArray((input as { invitations?: unknown }).invitations)
  ) {
    return (input as { invitations: NormalizedInvitation[] }).invitations;
  }
  return [];
}

// Invite dialog helpers (top-level for performance and consistency)
const EMAIL_SPLIT_REGEX = /[\s,;]+/g;
const emailSchema = z.email();

export const Route = createFileRoute('/_admin/settings/members')({
  component: RouteComponent,
});

function RouteComponent() {
  const DEFAULT_FETCH_LIMIT = 100;
  const { data, isLoading } = useAdminUsers({
    limit: DEFAULT_FETCH_LIMIT,
    offset: 0,
  });
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<'all' | 'Admin' | 'Member' | 'Guest'>('all');

  type Invitation = {
    id: string;
    email: string;
    role: string;
    status: string;
    createdAt: string | Date;
  };

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isInvitesLoading, setIsInvitesLoading] = useState(true);

  const users = data?.users ?? [];
  const organizationId = data?.organizationId;

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesRole = role === 'all' || u.role === role;
      if (!term) {
        return matchesRole;
      }
      const name = (u.name ?? '').toLowerCase();
      const email = (u.email ?? '').toLowerCase();
      return matchesRole && (name.includes(term) || email.includes(term));
    });
  }, [users, search, role]);

  const activeCount = filteredUsers.length;
  const invitedCount = invitations.length;

  const roleLabelFrom = (userRole: string) => {
    if (userRole === 'admin' || userRole === 'owner') {
      return 'Admin';
    }
    if (userRole === 'guest') {
      return 'Guest';
    }
    return 'Member';
  };

  const mapRoleForResend = (userRole: string): 'member' | 'admin' | 'owner' => {
    if (userRole === 'admin') {
      return 'admin';
    }
    if (userRole === 'owner') {
      return 'owner';
    }
    return 'member';
  };

  useEffect(() => {
    const controller = new AbortController();
    async function run() {
      try {
        setIsInvitesLoading(true);
        const orgId = await resolveOrganizationId(organizationId);
        if (!orgId) {
          setInvitations([]);
          return;
        }
        const list = await authClient.organization.listInvitations({
          query: { organizationId: orgId },
        });
        if (!controller.signal.aborted) {
          setInvitations(normalizeInvitations(list));
        }
      } catch {
        setInvitations([]);
      } finally {
        setIsInvitesLoading(false);
      }
    }
    run();
    return () => {
      controller.abort();
    };
  }, [organizationId]);

  async function handleResend(invite: Invitation) {
    try {
      let orgId = organizationId;
      if (!orgId) {
        const { data: orgs } = await authClient.organization.list();
        orgId = orgs?.[0]?.id;
      }
      if (!orgId) {
        toast.error('Organization not found');
        return;
      }
      const roleToSend = mapRoleForResend(invite.role);
      const result = await authClient.organization.inviteMember({
        email: invite.email,
        role: roleToSend,
        resend: true,
        organizationId: orgId,
      });
      if ((result as { error?: { message?: string } }).error) {
        toast.error(
          (result as { error?: { message?: string } }).error?.message ??
            'Failed to resend invite',
        );
      } else {
        toast.success(`Resent invite to ${invite.email}`);
      }
    } catch {
      toast.error('Failed to resend invite');
    }
  }

  async function handleRevoke(invite: Invitation) {
    try {
      await authClient.organization.cancelInvitation({
        invitationId: invite.id,
      });
      setInvitations((prev) => prev.filter((i) => i.id !== invite.id));
      toast.success('Invitation revoked');
    } catch {
      toast.error('Failed to revoke invitation');
    }
  }

  function exportCSV() {
    const headers = ['Name', 'Email', 'Role', 'Status', 'Joined'];
    const rows = filteredUsers.map((u) => [
      u.name ?? '',
      u.email ?? '',
      u.role ?? '',
      u.status ?? '',
      u.joinedDate ?? '',
    ]);

    const csv = [headers, ...rows]
      .map((r) =>
        r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(','),
      )
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'members.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  const statusDotClass = (status: string | undefined) => {
    if (status === 'online') {
      return 'bg-emerald-500';
    }
    if (status === 'away') {
      return 'bg-yellow-500';
    }
    return 'bg-muted-foreground';
  };

  const SKELETON_ROW_COUNT = 5;
  const RANDOM_SLICE_START = 2;
  const RANDOM_BASE = 36;
  const skeletonKeys = useMemo(
    () =>
      Array.from({ length: SKELETON_ROW_COUNT }, () =>
        Math.random().toString(RANDOM_BASE).slice(RANDOM_SLICE_START),
      ),
    [],
  );

  let tableContent: ReactNode;
  if (isLoading || isInvitesLoading) {
    tableContent = skeletonKeys.map((key) => (
      <TableRow className='border-b-0' key={key}>
        <TableCell>
          <div className='flex items-center gap-3'>
            <Skeleton className='size-8 rounded-full' />
            <div className='space-y-1'>
              <Skeleton className='h-4 w-40' />
              <Skeleton className='h-3 w-48' />
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Skeleton className='h-4 w-56' />
        </TableCell>
        <TableCell>
          <Skeleton className='h-4 w-16' />
        </TableCell>
        <TableCell>
          <Skeleton className='h-4 w-24' />
        </TableCell>
        <TableCell>
          <Skeleton className='h-5 w-16' />
        </TableCell>
      </TableRow>
    ));
  } else {
    tableContent = (
      <>
        {(activeCount > 0 || invitedCount === 0) && (
          <TableRow className='bg-muted/30'>
            <TableCell className='text-muted-foreground' colSpan={5}>
              Active {activeCount}
            </TableCell>
          </TableRow>
        )}
        {filteredUsers.map((u) => (
          <TableRow className='border-b-0' key={u.id}>
            <TableCell>
              <div className='flex items-center gap-3'>
                <Avatar>
                  <AvatarImage alt={u.name} src={u.avatarUrl} />
                  <AvatarFallback>
                    {(u.name ?? 'U')
                      .split(' ')
                      .map((p) => p[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className='leading-tight'>
                  <div className='font-medium'>{u.name}</div>
                  <div className='text-muted-foreground text-xs'>{u.email}</div>
                </div>
              </div>
            </TableCell>
            <TableCell className='text-muted-foreground'>{u.email}</TableCell>
            <TableCell>
              <div className='flex items-center gap-2'>
                <span
                  aria-hidden
                  className={statusDotClass(u.status)}
                  style={{ width: 8, height: 8, borderRadius: 9999 }}
                  title={u.status}
                />
                <span className='text-muted-foreground text-sm capitalize'>
                  {u.status}
                </span>
              </div>
            </TableCell>
            <TableCell className='text-muted-foreground'>
              {u.joinedDate}
            </TableCell>
            <TableCell>
              <Badge variant={u.role === 'Admin' ? 'default' : 'secondary'}>
                {u.role}
              </Badge>
            </TableCell>
          </TableRow>
        ))}

        {invitedCount > 0 && (
          <TableRow className='bg-muted/30'>
            <TableCell className='text-muted-foreground' colSpan={5}>
              Invited {invitedCount}
            </TableCell>
          </TableRow>
        )}
        {(Array.isArray(invitations) ? invitations : []).map((inv) => {
          const createdDate =
            typeof inv.createdAt === 'string'
              ? inv.createdAt.split('T')[0]
              : inv.createdAt.toISOString().split('T')[0];
          const labelRole = roleLabelFrom(inv.role);
          return (
            <TableRow className='group border-b-0' key={inv.id}>
              <TableCell>
                <div className='flex items-center gap-3'>
                  <Avatar>
                    <AvatarImage alt={inv.email} src={undefined} />
                    <AvatarFallback>
                      {inv.email.split('@')[0].slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='leading-tight'>
                    <div className='font-medium'>{inv.email}</div>
                    <div className='text-muted-foreground text-xs'>
                      {inv.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className='text-muted-foreground'>
                {inv.email}
              </TableCell>
              <TableCell>
                <div className='flex items-center gap-2'>
                  <span
                    aria-hidden
                    className='bg-muted-foreground'
                    style={{ width: 8, height: 8, borderRadius: 9999 }}
                    title='invited'
                  />
                  <span className='text-muted-foreground text-sm capitalize'>
                    Invited
                  </span>
                </div>
              </TableCell>
              <TableCell className='text-muted-foreground'>
                {createdDate}
              </TableCell>
              <TableCell>
                <div className='flex items-center justify-end gap-2'>
                  <Badge variant='secondary'>{labelRole} (Invited)</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        aria-label='More actions'
                        className='size-8 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100'
                        type='button'
                        variant='ghost'
                      >
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem onClick={() => handleResend(inv)}>
                        Resend invite
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className='text-destructive'
                        onClick={() => handleRevoke(inv)}
                      >
                        Revoke invite
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          );
        })}

        {activeCount === 0 && invitedCount === 0 && (
          <TableRow>
            <TableCell
              className='py-8 text-center text-muted-foreground'
              colSpan={5}
            >
              No members found
            </TableCell>
          </TableRow>
        )}
      </>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='font-semibold text-2xl tracking-tight'>Members</h1>
        <div className='flex items-center gap-2'>
          <Button onClick={exportCSV} type='button' variant='outline'>
            Export CSV
          </Button>
          <InviteUsersDialog />
        </div>
      </div>

      <div className='flex flex-wrap items-center gap-3'>
        <div className='relative w-full max-w-md'>
          <Input
            aria-label='Search members by name or email'
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search by name or email'
            type='search'
            value={search}
          />
        </div>
        <Select onValueChange={(v) => setRole(v as typeof role)} value={role}>
          <SelectTrigger aria-label='Filter by role'>
            <SelectValue placeholder='All' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All</SelectItem>
            <SelectItem value='Admin'>Admin</SelectItem>
            <SelectItem value='Member'>Member</SelectItem>
            <SelectItem value='Guest'>Guest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow className='border-b-0'>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{tableContent}</TableBody>
        </Table>
      </div>
    </div>
  );
}

function InviteUsersDialog() {
  const [open, setOpen] = useState(false);
  const [rawEmails, setRawEmails] = useState('');

  const parsedEmails = useMemo(() => {
    const parts = rawEmails
      .split(EMAIL_SPLIT_REGEX)
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const unique = Array.from(new Set(parts));
    const valid = unique.filter((e) => emailSchema.safeParse(e).success);
    return { unique, valid } as const;
  }, [rawEmails]);

  const hasValidEmails = parsedEmails.valid.length > 0;

  async function handleSendInvites() {
    if (!hasValidEmails) {
      toast.error('Please enter at least one valid email.');
      return;
    }

    const { data, error } = await authClient.organization.list();

    if (error) {
      toast.error('Something went wrong');
      return;
    }

    const invitaitonPromises = parsedEmails.valid.map(async (email) => {
      const res = await authClient.organization.inviteMember({
        email,
        role: 'member',
        resend: true,
        organizationId: data[0].id,
      });
      return res;
    });
    const results = await Promise.all(invitaitonPromises);
    for (const result of results) {
      if (result.error) {
        toast.error(result.error.message ?? 'Failed to invite user');
      } else {
        toast.success(
          `Invitation email has been sent to ${result.data.email}.`,
        );
      }
    }
    setOpen(false);
    setRawEmails('');
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button type='button'>Invite</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite members</DialogTitle>
          <DialogDescription>
            Add one or more email addresses, separated by commas. An invite
            email will be sent to each address.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-2'>
          <Label htmlFor='invite-emails'>Email addresses</Label>
          <Textarea
            aria-describedby='invite-note'
            id='invite-emails'
            onChange={(e) => setRawEmails(e.target.value)}
            placeholder='jane@acme.com, john@acme.com'
            rows={5}
            value={rawEmails}
          />
          <p className='text-muted-foreground text-xs' id='invite-note'>
            {parsedEmails.valid.length} valid email(s)
            {parsedEmails.unique.length !== parsedEmails.valid.length &&
              `, ${parsedEmails.unique.length - parsedEmails.valid.length} invalid`}
            .
          </p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type='button' variant='outline'>
              Cancel
            </Button>
          </DialogClose>
          <Button
            disabled={!hasValidEmails}
            onClick={handleSendInvites}
            type='button'
          >
            Send Invites
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
