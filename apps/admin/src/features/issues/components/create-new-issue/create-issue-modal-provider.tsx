import { CreateNewIssue } from './index';

export function CreateIssueModalProvider() {
  return (
    <div className='hidden'>
      <CreateNewIssue />
    </div>
  );
}
