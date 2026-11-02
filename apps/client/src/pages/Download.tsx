import { storageApi } from '@api/client';
import { Icon } from '@iconify/react';
import clsx from 'clsx';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import stores from '../stores';

const Download: React.FC = () => {
  const [recentRooms, setRecentRooms] = useState(stores.rooms.getRecentRooms());
  const refreshRooms = useCallback(
    () => setRecentRooms(stores.rooms.getRecentRooms()),
    [],
  );

  const navigate = useNavigate();
  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md flex flex-col gap-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center gap-y-6">
          <div className="flex flex-col items-center gap-y-1">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-2">
              <Icon icon="tabler:download" className="text-2xl" />
            </div>
            <p className="text-2xl font-bold text-slate-900">My Recent Recordings</p>
          </div>

          {recentRooms.length === 0 ? (
            <p className="text-sm text-slate-400 py-2">No recent recordings</p>
          ) : (
            <div className="w-full flex flex-col gap-y-3">
              <p className="text-sm text-slate-400 italic text-center select-none">
                Click to download as ZIP file
              </p>
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
                    onClick={() => storageApi.downloadRecordings(room)}
                  >
                    <span className="font-medium text-slate-700">Room {room}</span>
                    <Icon
                      className={clsx(
                        'text-xl text-slate-400',
                        'transition-colors duration-200',
                        'group-hover:text-indigo-600',
                      )}
                      icon="tabler:download"
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recentRooms.length > 0 && (
            <button
              className={clsx(
                'bg-rose-600 hover:bg-rose-700 text-white',
                'flex gap-x-2 items-center',
                'px-4 py-2 rounded-xl font-semibold shadow-sm transition-colors',
              )}
              onClick={() => {
                if (
                  window.confirm('Are you sure you want to clear all recordings?')
                ) {
                  stores.rooms.clearRecentRooms();
                  refreshRooms();
                }
              }}
            >
              <Icon icon="tabler:trash" className="text-xl" />
              <span>Clear All</span>
            </button>
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

export default Download;
export const Component = Download;
Component.displayName = 'Download';
