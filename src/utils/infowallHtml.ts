const URL_RE = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/gi;
const TRAILING_PUNCT_RE = /[.,;:!?)»]+$/;

const normalizeHref = (href: string) => {
  const h = href.trim();
  if (!h || h.startsWith('#')) return h;
  if (/^(https?:|mailto:|tel:)/i.test(h)) return h;
  if (/^www\./i.test(h)) return `https://${h}`;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(h)) return `mailto:${h}`;
  return h;
};

const linkifyTextNodes = (root: HTMLElement) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const targets: Text[] = [];
  let node = walker.nextNode();
  while (node) {
    const text = node as Text;
    if (!text.parentElement?.closest('a') && URL_RE.test(text.data)) targets.push(text);
    URL_RE.lastIndex = 0;
    node = walker.nextNode();
  }

  targets.forEach((textNode) => {
    const frag = document.createDocumentFragment();
    const text = textNode.data;
    let last = 0;
    URL_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = URL_RE.exec(text)) !== null) {
      let url = m[0];
      const trail = url.match(TRAILING_PUNCT_RE)?.[0] || '';
      if (trail) url = url.slice(0, -trail.length);
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      const a = document.createElement('a');
      a.href = normalizeHref(url);
      a.textContent = url;
      frag.appendChild(a);
      last = m.index + url.length;
      URL_RE.lastIndex = last;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    textNode.parentNode?.replaceChild(frag, textNode);
  });
};

export const prepareInfowallHtml = (html: string): string => {
  if (!html || typeof DOMParser === 'undefined') return html;
  const doc = new DOMParser().parseFromString(`<div id="iw-root">${html}</div>`, 'text/html');
  const root = doc.getElementById('iw-root');
  if (!root) return html;

  linkifyTextNodes(root);

  root.querySelectorAll('a').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href) return;
    const fixed = normalizeHref(href);
    a.setAttribute('href', fixed);
    if (!fixed.startsWith('#')) {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    }
    a.setAttribute('style', 'color:#1d4ed8;text-decoration:underline;word-break:break-word;cursor:pointer');
  });

  return root.innerHTML;
};
