import { createFileRoute } from '@tanstack/react-router';
import BlockNoteEditor from '@/components/blocknote-editor';
import { SectionCards } from '@/components/section-cards';
import { SiteHeader } from '@/components/site-header';

export const Route = createFileRoute('/_admin/editor')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <SiteHeader title="Editor" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <BlockNoteEditor />
          </div>
        </div>
      </div>
    </>
  );
}
