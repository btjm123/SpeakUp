import { Icon } from '@iconify/react/dist/iconify.js';
import clsx from 'clsx';
import { useMemo } from 'react';
import { getColor, getColorClasses, getIcon } from '../utils/names';

type Props = {
  username: string;
};

const Header: React.FC<Props> = ({ username }) => {
  const icon = useMemo(() => getIcon(username), [username]);
  const { background, foreground, border } = useMemo(
    () => getColorClasses(getColor(username)),
    [username],
  );

  return (
    <div className="w-full h-28 flex gap-x-4 justify-between items-center px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex gap-x-4 items-center">
        <div
          className={clsx(
            'transition-colors duration-500',
            'text-5xl rounded-full w-16 h-16 flex justify-center items-center',
            'overflow-clip',
            background,
            'border-2',
            border,
          )}
        >
          <Icon inline icon={icon} className={foreground} />
        </div>
        <div className="flex flex-col justify-center items-start gap-y-1">
          <strong className="text-lg leading-none text-slate-500 font-medium">Hello,</strong>
          <span className="text-2xl leading-none font-bold text-slate-900">{username}</span>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-x-2 text-slate-400">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white flex items-center justify-center">
          <Icon icon="tabler:microphone" className="text-base" />
        </div>
        <span className="font-semibold text-slate-400 tracking-tight">SpeakUp</span>
      </div>
    </div>
  );
};

export default Header;
