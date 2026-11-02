import { Icon } from '@iconify/react';
import clsx from 'clsx';
import { MEDIARECORDER_FORCED_DEVICES } from '../config/deviceOverrides';

type Props = {
  defaultMode: 'webrtc' | 'mediarecorder';
  onDefaultModeChange: (mode: 'webrtc' | 'mediarecorder') => void;
  isOpen: boolean;
  onToggle: () => void;
};

const DefaultModeModal: React.FC<Props> = ({
  defaultMode,
  onDefaultModeChange,
  isOpen,
  onToggle,
}) => {
  return (
    <div className="relative">
      {/* Toggle Button - Same style as Analytics/Queue */}
      <button
        type="button"
        onClick={onToggle}
        className={clsx(
          'w-14 h-14 rounded-full shadow-lg flex items-center justify-center',
          'transition-all duration-200',
          isOpen
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
            : 'bg-white hover:bg-slate-100 text-slate-700 border-2 border-slate-300'
        )}
        aria-label={isOpen ? 'Close settings' : 'Open settings'}
        title="Audio settings"
      >
        <Icon icon="tabler:settings" className="w-6 h-6" />
      </button>

      {/* Modal - Above button when open */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-72 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden flex flex-col z-50">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Icon icon="tabler:antenna" className="w-5 h-5" />
                Default audio mode
              </h3>
              <button
                type="button"
                onClick={onToggle}
                className="px-3 py-1.5 bg-slate-300 hover:bg-slate-400 rounded text-sm"
              >
                Close
              </button>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-slate-600 mb-3">
              Choose the default for new speakers when they join:
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className={clsx(
                  'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  'border',
                  defaultMode === 'webrtc'
                    ? 'bg-indigo-600 text-white border-indigo-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                )}
                onClick={() => onDefaultModeChange('webrtc')}
              >
                <span className="flex items-center justify-center gap-2">
                  <Icon icon="tabler:antenna" className="w-4 h-4" />
                  WebRTC
                </span>
              </button>
              <button
                type="button"
                className={clsx(
                  'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  'border',
                  defaultMode === 'mediarecorder'
                    ? 'bg-indigo-600 text-white border-indigo-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                )}
                onClick={() => onDefaultModeChange('mediarecorder')}
              >
                <span className="flex items-center justify-center gap-2">
                  <Icon icon="tabler:record" className="w-4 h-4" />
                  MediaRecorder
                </span>
              </button>
            </div>
            {MEDIARECORDER_FORCED_DEVICES.length > 0 && (
              <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                <span className="font-medium">Note:</span>{' '}
                {MEDIARECORDER_FORCED_DEVICES.map(d => d.label).join(', ')}{' '}
                {MEDIARECORDER_FORCED_DEVICES.length === 1 ? 'device will' : 'devices will'}{' '}
                always use MediaRecorder regardless of this setting (WebRTC is not recommended).
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DefaultModeModal;
