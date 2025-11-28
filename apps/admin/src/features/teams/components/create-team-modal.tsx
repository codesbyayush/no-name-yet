import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { adminClient } from '@/utils/admin-orpc';

interface CreateTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTeamModal({ open, onOpenChange }: CreateTeamModalProps) {
  const [teamName, setTeamName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Reset state when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTimeout(() => {
        setTeamName('');
      }, 300);
    }
    onOpenChange(newOpen);
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    setIsSubmitting(true);
    try {
      const data = await adminClient.organization.teams.createTeam({
        name: teamName,
      });

      if (data) {
        toast.success('Team created successfully');
        queryClient.invalidateQueries({ queryKey: ['org-teams'] });
        handleOpenChange(false);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create team');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={handleOpenChange}
      title='Create a new team'
      description='Add a new team to your organization to manage projects and members.'
    >
      <div className='space-y-4 py-4'>
        <form onSubmit={handleCreateTeam} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='team-name'>Team Name</Label>
            <Input
              id='team-name'
              placeholder='e.g. Engineering'
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className='flex justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={!teamName.trim() || isSubmitting}>
              {isSubmitting && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              Create Team
            </Button>
          </div>
        </form>
      </div>
    </ResponsiveModal>
  );
}
