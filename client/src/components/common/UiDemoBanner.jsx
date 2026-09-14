import { isUiDemoEnabled } from '../../utils/uiDemo';

/**
 * Banner shown while client-only UI demo data is active.
 * Remove with uiDemoData.js when real seed data is used.
 */
export default function UiDemoBanner() {
  if (!isUiDemoEnabled()) {
    return null;
  }

  return (
    <div
      className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-950"
      role="status"
    >
      UI demo mode — fake client data only (not saved to the database). Set{' '}
      <code className="rounded bg-amber-100 px-1">VITE_UI_DEMO=false</code> to
      use the real API.
    </div>
  );
}
