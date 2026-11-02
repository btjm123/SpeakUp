import { msToHMS } from '../utils/time';

type Props = {
  roomCode: string;
  timeRemaining: number;
};

const RoomInfo: React.FC<Props> = ({ roomCode, timeRemaining }) => {
  const [hours, minutes, seconds] = msToHMS(timeRemaining);
  return (
    <div className="flex items-center gap-x-6 bg-white rounded-2xl shadow-sm border border-slate-200 px-6 py-4">
      <div className="flex flex-col items-center">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          Room Code
        </span>
        <span className="font-mono text-3xl font-bold text-slate-900 tracking-wider">
          {roomCode}
        </span>
      </div>
      <div className="w-px h-10 bg-slate-200" />
      <div className="flex flex-col items-center">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          Time Remaining
        </span>
        <span className="font-mono text-2xl font-bold text-slate-900">
          {hours.toString().padStart(2, '0')}:
          {minutes.toString().padStart(2, '0')}:
          {seconds.toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};

export default RoomInfo;
