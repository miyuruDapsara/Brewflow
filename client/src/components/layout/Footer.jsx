import { APP_NAME } from '../../utils/constants';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200/80 bg-white/50">
      <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-stone-500">
        {APP_NAME} — café ordering foundation
      </div>
    </footer>
  );
}
