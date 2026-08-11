import { Link } from 'react-router-dom';
import Seal from '../components/Seal';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col justify-center items-center">
      <div className="text-center">
        <div className="flex justify-center mb-6 opacity-50 grayscale">
          <Seal status="pending" size={64} animate={false} />
        </div>
        <h1 className="font-display text-3xl mb-2">Page Not Found</h1>
        <p className="text-slate text-sm mb-8">The requested registry path does not exist.</p>
        <Link
          to="/"
          className="inline-block rounded-lg bg-ink text-paper px-6 py-2.5 text-sm font-medium hover:bg-ink-2 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
