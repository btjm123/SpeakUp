import { roomsApi } from '@api/client';
import { Icon } from '@iconify/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AvatarSelector from '../components/AvatarSelector';
import RoomCodeInput, { RoomInputApi } from '../components/RoomCodeInput';
import stores from '../stores';

const ROOM_CODE_PARAM = 'code';

const Join: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    // Clear the URL
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  const [roomCode, setRoomCode] = useState<string>();
  const checkIsRoomValid = useCallback(async (code: string) => {
    const room = await roomsApi.joinRoom(code);
    if (!room) {
      alert('Room not found!');
      return;
    }
    setRoomCode(code);
  }, []);

  const inputControl = useRef<RoomInputApi>(null);
  const navigate = useNavigate();
  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4 py-12 animate-fade-up">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center gap-y-8">
        <div className="flex flex-col items-center gap-y-1">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white flex items-center justify-center mb-2">
            <Icon icon="tabler:school" className="text-2xl" />
          </div>
          <p className="text-2xl font-bold text-slate-900">Join a Room</p>
        </div>

        <RoomCodeInput
          defaultValue={searchParams.get(ROOM_CODE_PARAM)}
          onSubmit={checkIsRoomValid}
          submitText={roomCode ? undefined : 'Join'}
          api={inputControl}
        />
        {roomCode && (
          <>
            <p className="text-lg font-semibold text-slate-900 text-center">
              Now, choose an avatar for yourself&hellip;
            </p>
            <AvatarSelector
              onSubmit={(username) => {
                stores.common.setUsername(username);
                navigate(`/${roomCode}`);
              }}
              // Reset page on cancel
              onCancel={() => {
                setRoomCode(undefined);
                inputControl.current?.clear();
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Join;
export const Component = Join;
Component.displayName = 'Join';
