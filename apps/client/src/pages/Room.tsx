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

  return (
    <div className="min-h-screen bg-slate-50">
      <Header username={username} />
      <div className="max-w-md mx-auto px-4 py-8 flex flex-col items-center gap-y-6 text-center">
        <RoomInfo roomCode={roomCode!} timeRemaining={timeRemaining} />

        <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col gap-y-6 justify-center items-center">
          {/* Priority Selector - show when off or waiting */}
          {(state === 'off' || state === 'waiting') && (
            <div className="flex flex-col gap-2 items-center">
              <label className="text-sm font-medium text-slate-500">
                {state === 'waiting' ? 'Update Urgency Level:' : 'Urgency Level:'}
              </label>
              <div className="flex gap-2">
                {[
                  { value: 0, label: 'Normal', color: 'bg-slate-400' },
                  { value: 1, label: 'Medium', color: 'bg-yellow-400' },
                  { value: 2, label: 'High', color: 'bg-orange-400' },
                  { value: 3, label: 'Urgent', color: 'bg-red-400' },
                ].map(({ value, label, color }) => (
                  <button
                    key={value}
                    onClick={() => setPriority(value)}
                    className={clsx(
                      'px-3 py-1 rounded-lg text-sm font-medium transition-all border-2',
                      priority === value
                        ? `${color} text-white border-transparent`
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent',
                    )}
                    title={label}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            className={clsx(
              'w-36 h-36 rounded-full text-white font-bold',
              'text-6xl flex justify-center items-center transition-colors shadow-sm',
              state === 'on' && 'bg-emerald-500',
              state === 'waiting' && 'bg-amber-500',
              state === 'blocked' && 'bg-slate-400',
              state === 'off' && 'bg-indigo-600',
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
            'px-5 py-2.5 bg-rose-600 text-white font-semibold hover:bg-rose-700 rounded-xl shadow-sm transition-colors',
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
