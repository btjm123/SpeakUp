import { roomsApi } from '@api/client';
import { Icon } from '@iconify/react';
import clsx from 'clsx';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import stores from '../stores';

const Create: React.FC = () => {
  const [enableCloudRecording, setEnableCloudRecording] = useState(false);

  const createRoom = useCallback(async () => {
    const createdRoom = await roomsApi.createRoom({ enableCloudRecording });
    if (!createdRoom) {
      return;
    }
    return createdRoom.code;
  }, [enableCloudRecording]);

  // Note: this value is non-reactive!
  const recentRooms = stores.rooms.getRecentRooms();

  const navigate = useNavigate();
  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4 py-12 animate-fade-up">
      <div className="w-full max-w-md flex flex-col gap-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center gap-y-6">
          <div className="flex flex-col items-center gap-y-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white flex items-center justify-center mb-2">
              <Icon icon="tabler:chalkboard" className="text-2xl" />
            </div>
            <p className="text-2xl font-bold text-slate-900">Create a Room</p>
          </div>

          <button
            className={clsx(
              'px-4 py-3 rounded-xl font-semibold w-full transition-colors',
              'bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:brightness-105 text-white shadow-sm transition-all',
            )}
            onClick={async () => {
              const roomCode = await createRoom();
              if (!roomCode) {
                return;
              }
              if (enableCloudRecording) {
                stores.rooms.addRecentRoom(roomCode);
              }
              navigate(`/listen/${roomCode}`);
            }}
          >
            Create New Room
          </button>

          <label className="flex items-center gap-x-2 text-sm text-slate-600 select-none">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              checked={enableCloudRecording}
              onChange={(e) => setEnableCloudRecording(e.target.checked)}
            />
            <span>Enable Cloud Recording</span>
          </label>
          <p className="text-xs text-slate-400 text-center -mt-4">
            <strong className="font-medium text-slate-500">Note:</strong> You cannot change this later.
          </p>
        </div>

        <div className="flex gap-x-4 items-center">
          <hr className="flex-1 border-slate-200" />
          <span className="text-sm text-slate-400 select-none">or</span>
          <hr className="flex-1 border-slate-200" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-y-3">
          <p className="text-lg font-semibold text-slate-900">Recent Rooms</p>
          <p className="text-sm text-slate-500">
            Only rooms that have cloud recording enabled will be shown.
          </p>
          {recentRooms.length === 0 ? (
            <p className="text-sm text-slate-400 py-2">No recent rooms</p>
          ) : (
            <ul className="flex flex-col gap-y-2">
              {recentRooms.map((room) => (
                <li
                  key={room}
                  className={clsx(
                    'bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl',
                    'w-full px-4 py-3 transition-colors',
                    'cursor-pointer',
                    'flex justify-between items-center',
                    'group',
                  )}
                  onClick={() => navigate(`/listen/${room}`)}
                >
                  <span className="font-medium text-slate-700">Room {room}</span>
                  <Icon
                    className={clsx(
                      'text-xl text-slate-400',
                      'transition-colors duration-200',
                      'group-hover:text-indigo-600',
                    )}
                    icon="tabler:arrow-right"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          className={clsx(
            'px-4 py-2.5 rounded-xl font-medium',
            'text-slate-500 hover:text-slate-700 hover:bg-slate-100',
            'transition-colors',
          )}
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default Create;
export const Component = Create;
Component.displayName = 'Create';
