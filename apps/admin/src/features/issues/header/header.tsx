import HeaderNav from './header-nav';
import HeaderOptions from './header-options';

export default function Header({
  hideOptions = false,
}: {
  hideOptions?: boolean;
}) {
  return (
    <div className='flex w-full flex-col items-center'>
      <HeaderNav />
      {!hideOptions && <HeaderOptions />}
    </div>
  );
}
