import { addons } from '@storybook/manager-api';
import { create } from '@storybook/theming/create';

// Make the top-left brand a one-click jump to the sibling Storybook. The URL is resolved at
// runtime so it works both locally (ports 6006 ↔ 6007) and on GitHub Pages (/core/ ↔ /react/).
function siblingUrl(): string {
  const { origin, pathname, protocol, hostname, port } = window.location;
  if (pathname.includes('/core/')) return `${origin}${pathname.replace('/core/', '/react/')}`;
  if (pathname.includes('/react/')) return `${origin}${pathname.replace('/react/', '/core/')}`;
  return `${protocol}//${hostname}:${port === '6006' ? '6007' : '6006'}/`;
}

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'quoin · core → React ↗',
    brandUrl: siblingUrl(),
    brandTarget: '_self',
  }),
});
