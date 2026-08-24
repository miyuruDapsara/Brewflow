import { APP_NAME } from '../../utils/constants';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--bf-border)] bg-[#2a1a12] text-[#f7f1e8]">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-10 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span className="bf-display text-lg font-bold">{APP_NAME}</span>
        <span className="text-[#d4c4b4]">
          Fresh coffee · Handcrafted drinks · Easy pickup
        </span>
      </div>
    </footer>
  );
}
