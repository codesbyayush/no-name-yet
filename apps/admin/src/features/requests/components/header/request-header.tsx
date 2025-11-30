import { RequestHeaderNav } from './request-header-nav';
import { RequestHeaderOptions } from './request-header-options';

export function RequestHeader() {
  return (
    <div className='flex w-full flex-col items-center'>
      <RequestHeaderNav />
      <RequestHeaderOptions />
    </div>
  );
}
