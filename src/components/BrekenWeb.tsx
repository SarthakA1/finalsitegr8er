/**
 * Breken's web sensor (MIT). Loads /breken-web.js once. It records which control and which screen
 * — never what anyone types — and reports only the moments someone is clearly stuck, so Breken can
 * replay them and fix what broke. Read it: public/breken-web.js.
 *
 * Off: <BrekenWeb enabled={false} /> or NEXT_PUBLIC_BREKEN_WEB=off; or delete this file and public/breken-web.js.
 * The one-line "Something not working?" prompt is off unless you pass `prompt`.
 */
import { useEffect } from 'react';

export default function BrekenWeb({ enabled = true, prompt = true }: { enabled?: boolean; prompt?: boolean }) {
  useEffect(() => {
    if (!enabled || typeof document === 'undefined' || document.getElementById('breken-web')) return;
    const s = document.createElement('script');
    s.id = 'breken-web';
    s.src = '/breken-web.js';
    s.async = true;
    s.dataset.endpoint = "/api/breken-report/web-events";
    s.dataset.control = "https://breken.ai/intake/v1/config?key=brk_pub_778d39d30b244349_xs5NLg5cB_yc82nHj5zWpI1nbKzKxiyByyginNbed8w";
    s.dataset.framework = "next";
    if (prompt) s.dataset.prompt = 'on';
    document.head.appendChild(s);
    // No cleanup: the sensor lives for the page, and guards itself against a second load.
  }, [enabled, prompt]);
  return null;
}
