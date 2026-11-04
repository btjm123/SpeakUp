// src/pages/Listen.tsx (or wherever this file lives)
import { roomsApi } from '@api/client';
import { Room } from '@api/client/types';
import { Icon } from '@iconify/react';
import clsx from 'clsx';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Analytics from '../components/Analytics';
import QueueManagement from '../components/QueueManagement';
import RoomInfo from '../components/RoomInfo';
import { useWebRTCAudio } from '../hooks/useWebRTCAudio';
import { SERVER_HOST, WS_PROTOCOL } from '../utils/constants';

type Props = {
  roomCode: string;
  expiresAt: Date;
};

const ListenBody: React.FC<Props> = ({ roomCode, expiresAt }) => {
  const {
    ref,
    listening,
    playing,
    listen,
    stop: stopListening,
    skip,
    queueInfo,
    kickUser,
    reorderUser,
    moveUserToPosition,
    setQueueSortMode,
    setDefaultAudioMode,
    setAudioPipelineMode,
    audioPipelineMode,
    setMicGain,
  } = useWebRTCAudio(`${WS_PROTOCOL}://${SERVER_HOST}/ws/${roomCode}`);

  const [queueOpen, setQueueOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  // Directional gain: lowers student mic sensitivity to curb the feedback
  // loop that happens when two students are in the same physical room and
  // pick up each other's playback. 0.2 matches the server/client default.
  const [micGain, setMicGainValue] = useState(0.2);
  const handleMicGainChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      setMicGainValue(value);
      setMicGain(value);
    },
    [setMicGain],
  );

  const handleClick = useCallback(() => {
    if (listening) {
      stopListening();
    } else {
      setDefaultAudioMode('mediarecorder');
      listen();
    }
  }, [listen, listening, stopListening, setDefaultAudioMode]);

  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState(
    expiresAt.getTime() - Date.now(),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const updated = expiresAt.getTime() - Date.now();
      setTimeRemaining(updated);
      if (updated <= 0) {
        stopListening();
        navigate('/');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, navigate, stopListening]);

  // Optional: Keyboard shortcut "S" to skip
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 's' || e.key === 'S') && listening) {
        e.preventDefault();
        skip(); // Skip works as long as listening, doesn't need playing
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [listening, skip]);

  // Optional UI guard to avoid spam clicking
  const [cooldown, setCooldown] = useState(false);
  const handleSkip = useCallback(() => {
    // Skip should work as long as we're listening - doesn't need playing to be set
    // This allows skipping even before first connection is established
    if (!listening || cooldown) return;
    skip();
    setCooldown(true);
    // brief cooldown to avoid accidental double-skips
    setTimeout(() => setCooldown(false), 500);
    // small haptic hint on supported devices
    (navigator as any).vibrate?.(10);
  }, [listening, cooldown, skip]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center gap-y-6 px-4 py-12 animate-fade-up">
      <div className="flex items-center gap-x-2 text-slate-400">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white flex items-center justify-center">
          <Icon icon="tabler:microphone" className="text-sm" />
        </div>
        <span className="font-semibold tracking-tight">SpeakUp</span>
      </div>

      <RoomInfo roomCode={roomCode} timeRemaining={timeRemaining} />

      <div className="relative w-full max-w-md overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col gap-y-6 items-center">
        <div
          className={clsx(
            'absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r',
            listening ? 'from-emerald-400 to-teal-500' : 'from-rose-400 to-rose-500',
          )}
        />

        <div className="flex rounded-lg overflow-hidden border border-slate-200">
          <button
            className={clsx(
              'px-4 py-1.5 text-sm font-semibold transition-colors',
              audioPipelineMode === 'live'
                ? 'bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50',
            )}
            onClick={() => setAudioPipelineMode('live')}
          >
            Live
          </button>
          <button
            className={clsx(
              'px-4 py-1.5 text-sm font-semibold transition-colors border-l border-slate-200',
              audioPipelineMode === 'prerecord'
                ? 'bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50',
            )}
            onClick={() => setAudioPipelineMode('prerecord')}
          >
            Prerecord
          </button>
        </div>

        <div className="relative w-36 h-36 flex items-center justify-center">
          {listening && (
            <>
              <span className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 animate-pulse-ring" />
              <span
                className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 animate-pulse-ring"
                style={{ animationDelay: '0.6s' }}
              />
            </>
          )}
          <button
            className={clsx(
              'relative w-36 h-36 rounded-full text-white font-bold bg-gradient-to-br',
              'text-6xl flex justify-center items-center shadow-lg',
              'transition-all duration-300',
              listening ? 'from-emerald-400 to-teal-500' : 'from-rose-400 to-rose-500 animate-breathe',
            )}
            onClick={handleClick}
            aria-label={listening ? 'Stop listening' : 'Start listening'}
          >
            <Icon icon={listening ? 'tabler:volume' : 'tabler:volume-off'} />
          </button>
        </div>

        <p className="text-slate-500">{listening ? <>Tuning in&hellip;</> : 'Everyone is muted'}</p>

        {/* Skip Speaker button */}
        <button
          type="button"
          className={clsx(
            'px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-sm border',
            listening && !cooldown
              ? 'bg-gradient-to-br from-amber-400 to-orange-500 hover:brightness-105 text-white border-transparent'
              : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
          )}
          disabled={!listening || cooldown}
          onClick={handleSkip}
          aria-disabled={!listening || cooldown}
          aria-label="Skip current speaker"
          title={listening ? 'Skip (S)' : 'Start listening to enable skip'}
        >
          <div className="flex items-center gap-2">
            <Icon icon="tabler:player-skip-forward" />
            <span>Skip speaker (S)</span>
          </div>
        </button>

        {/* Hint who we're hearing */}
        {listening && playing && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="flex items-end gap-0.5 h-3">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-0.5 h-full bg-emerald-500 rounded-full animate-eq-bar"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </span>
            <span>Listening to {playing}&hellip;</span>
          </div>
        )}

        <audio ref={ref} preload="auto" />
      </div>

      <button
        type="button"
        className="px-5 py-2.5 bg-gradient-to-br from-rose-500 to-rose-600 hover:brightness-105 text-white font-semibold rounded-xl transition-all shadow-sm"
        onClick={() => navigate('/')}
      >
        Leave
      </button>

      {/* Directional gain: reduces student mic sensitivity to cut feedback
          when two students are speaking from the same room. */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="directional-gain" className="flex items-center gap-x-2 text-sm font-semibold text-slate-700">
            <Icon icon="tabler:adjustments-horizontal" className="text-lg text-slate-400" />
            Directional Gain
          </label>
          <span className="text-sm font-mono text-slate-500">{Math.round(micGain * 100)}%</span>
        </div>
        <input
          id="directional-gain"
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={micGain}
          onChange={handleMicGainChange}
          className="w-full accent-indigo-500"
          aria-label="Directional gain"
        />
        <p className="text-xs text-slate-400">
          Lower this if two students in the same room are picking up each
          other&apos;s audio and causing feedback.
        </p>
      </div>

      {/* Queue Management, Analytics, and Settings - Stacked */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
        <QueueManagement
          queueInfo={queueInfo}
          onKickUser={kickUser}
          onReorderUser={reorderUser}
          onMoveToPosition={moveUserToPosition}
          onSetSortMode={setQueueSortMode}
          isOpen={queueOpen}
          onToggle={() => setQueueOpen(!queueOpen)}
        />
        <Analytics
          roomCode={roomCode}
          isOpen={analyticsOpen}
          onToggle={() => setAnalyticsOpen(!analyticsOpen)}
        />
      </div>
    </div>
  );
};

const Listen: React.FC = () => {
  const { room: roomCode } = useParams<{ room: string }>();

  const navigate = useNavigate();
  const [room, setRoom] = useState<Room>();
  useEffect(() => {
    const getTtl = async () => {
      const room = await roomsApi.joinRoom(roomCode!);
      if (!room) {
        navigate('/create');
      }
      setRoom(room!);
    };
    getTtl();
  }, [navigate, roomCode]);

  if (!room) {
    return (
      <div className="w-full h-screen flex flex-col justify-center items-center gap-y-4 text-slate-400">
        <p>Loading&hellip;</p>
      </div>
    );
  }

  return <ListenBody roomCode={room.code} expiresAt={room.expiredAt} />;
};

export default Listen;
export const Component = Listen;
Component.displayName = 'Listen';
