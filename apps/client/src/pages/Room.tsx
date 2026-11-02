import { roomsApi } from '@api/client';
import { Icon } from '@iconify/react';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import RoomInfo from '../components/RoomInfo';
import { useWebRTCStreaming } from '../hooks/useWebRTCStreaming';
import stores from '../stores';
import { SERVER_HOST, WS_PROTOCOL } from '../utils/constants';

const Room: React.FC = () => {
  const { room: roomCode } = useParams<{ room: string }>();
  const username = stores.common.getUsername();

  const [priority, setPriority] = useState<number>(0); // 0 = normal, 1 = medium, 2 = high, 3 = urgent
  
  const { state, connected, beginStream, endStream } = useWebRTCStreaming(
    `${WS_PROTOCOL}://${SERVER_HOST}/ws/${roomCode}`,
    username ?? '',
    undefined,
    priority,
  );
  const navigate = useNavigate();

  const [timeRemaining, setTimeRemaining] = useState(Number.MAX_SAFE_INTEGER);
  useEffect(() => {
    const getTtl = async () => {
      const ttl = await roomsApi.getTtl(roomCode!);
      if (!ttl) {
        stores.common.setUsername(null);
        navigate('/');
        return;
      }
      setTimeRemaining(ttl);
    };
    getTtl();
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1000) {
          stores.common.setUsername(null);
          navigate('/');
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => {
      clearInterval(interval);
      setTimeRemaining(Number.MAX_SAFE_INTEGER);
    };
  }, [navigate, roomCode]);

  // WebRTC handles audio stream automatically, no need for manual start/stop

  if (!username) {
    return <Navigate to="/join" />;
  }

  const buttonDisabled = !connected || timeRemaining <= 0;

  const stateAccent = clsx(
    state === 'on' && 'from-emerald-400 to-teal-500',
    state === 'waiting' && 'from-amber-400 to-orange-500',
    state === 'blocked' && 'from-slate-300 to-slate-400',
    state === 'off' && 'from-indigo-500 to-fuchsia-500',
  );

  return (
    <div className="min-h-screen">
      <Header username={username} />
      <div className="max-w-md mx-auto px-4 py-8 flex flex-col items-center gap-y-6 text-center animate-fade-up">
        <RoomInfo roomCode={roomCode!} timeRemaining={timeRemaining} />

        <div className="relative w-full overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col gap-y-6 justify-center items-center">
          <div className={clsx('absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r', stateAccent)} />

          {/* Priority Selector - show when off or waiting */}
          {(state === 'off' || state === 'waiting') && (
            <div className="flex flex-col gap-2 items-center">
              <label className="text-sm font-medium text-slate-500">
                {state === 'waiting' ? 'Update Urgency Level:' : 'Urgency Level:'}
              </label>
              <div className="flex gap-2">
                {[
                  { value: 0, label: 'Normal', icon: 'tabler:circle', color: 'from-slate-400 to-slate-500' },
                  { value: 1, label: 'Medium', icon: 'tabler:alert-circle', color: 'from-yellow-400 to-amber-500' },
                  { value: 2, label: 'High', icon: 'tabler:flame', color: 'from-orange-400 to-orange-600' },
                  { value: 3, label: 'Urgent', icon: 'tabler:alert-triangle', color: 'from-red-500 to-rose-600' },
                ].map(({ value, label, icon, color }) => (
                  <button
                    key={value}
                    onClick={() => setPriority(value)}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-all border-2 flex items-center gap-1.5',
                      priority === value
                        ? `bg-gradient-to-br ${color} text-white border-transparent shadow-sm`
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent',
                    )}
                    title={label}
                  >
                    <Icon icon={icon} className="text-base" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="relative w-36 h-36 flex items-center justify-center">
            {(state === 'on' || state === 'waiting') && (
              <>
                <span className={clsx('absolute inset-0 rounded-full bg-gradient-to-br animate-pulse-ring', stateAccent)} />
                <span
                  className={clsx('absolute inset-0 rounded-full bg-gradient-to-br animate-pulse-ring', stateAccent)}
                  style={{ animationDelay: '0.6s' }}
                />
              </>
            )}
            <button
              className={clsx(
                'relative w-36 h-36 rounded-full text-white font-bold bg-gradient-to-br',
                'text-6xl flex justify-center items-center transition-all shadow-lg',
                stateAccent,
                state === 'off' && !buttonDisabled && 'animate-breathe',
              )}
              disabled={buttonDisabled}
              onClick={async () => {
                if (state === 'off' || state === 'blocked') {
                  try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    beginStream(stream);
                  } catch (err) {
                    console.error('[Room] Mic access failed:', err);
                  }
                } else {
                  endStream();
                }
              }}
              title={!connected ? 'Connecting to server…' : undefined}
            >
              <Icon icon="tabler:microphone" />
            </button>
          </div>

          {state === 'blocked' && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              <Icon icon="tabler:ban" className="w-5 h-5" />
              <span>Recording blocked while instructor is speaking.</span>
            </div>
          )}

          <p className="text-sm text-slate-400">
            WS: {connected ? 'connected' : 'connecting…'} • State: {state}
          </p>
        </div>

        <button
          className={clsx(
            'px-5 py-2.5 bg-gradient-to-br from-rose-500 to-rose-600 text-white font-semibold hover:brightness-105 rounded-xl shadow-sm transition-all',
          )}
          onClick={() => {
            try { endStream(); } catch {}
            stores.common.setUsername(null);
            navigate('/');
          }}
        >
          Leave
        </button>
      </div>
    </div>
  );
};

export default Room;
export const Component = Room;
Component.displayName = 'Room';
