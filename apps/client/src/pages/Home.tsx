import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center gap-y-10 px-4 py-12">
      <div className="flex flex-col items-center gap-y-2">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
          <Icon icon="tabler:microphone" className="text-3xl" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          SpeakUp
        </h1>
        <p className="text-slate-500">Push-to-talk for the classroom</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center gap-y-6">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
          I am a/an&hellip;
        </p>
        <div className="flex gap-x-4 w-full">
          <Link
            to="/join"
            className="flex-1 aspect-square rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors flex flex-col items-center justify-center gap-y-2 text-slate-700"
          >
            <Icon icon="tabler:school" className="text-3xl text-indigo-600" />
            <span className="text-lg font-semibold">Student</span>
          </Link>
          <Link
            to="/create"
            className="flex-1 aspect-square rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors flex flex-col items-center justify-center gap-y-2 text-slate-700"
          >
            <Icon icon="tabler:chalkboard" className="text-3xl text-indigo-600" />
            <span className="text-lg font-semibold">Instructor</span>
          </Link>
        </div>
      </div>

      <div className="flex flex-col items-center gap-y-2 text-sm">
        <Link
          className="text-indigo-600 hover:text-indigo-700 font-medium"
          to="/download"
        >
          Download Past Recordings
        </Link>
        <Link
          className="text-slate-500 hover:text-slate-700"
          to="/contact"
        >
          Send Feedback / Report Issues
        </Link>
      </div>
    </div>
  );
};

export default Home;
export const Component = Home;
Component.displayName = 'Home';
