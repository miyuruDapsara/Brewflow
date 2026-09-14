/**
 * Client-only UI demo switch.
 * Default ON for local visual preview. Set VITE_UI_DEMO=false to use API only.
 */

export function isUiDemoEnabled() {
  const flag = process.env.VITE_UI_DEMO;
  if (flag === undefined || flag === '') {
    return true;
  }
  return String(flag).toLowerCase() === 'true' || flag === '1';
}
