/**
 * Resolve files under public/ for the normal root page, GitHub Pages sub-paths,
 * and nested /tests/runtime/*.html Vite harnesses.
 */
export function publicAssetUrl(path: string): string {
  const clean = path.replace(/^\/+/, '');
  const pathname = window.location.pathname;
  const runtimeMarker = '/tests/runtime/';
  const runtimeIndex = pathname.indexOf(runtimeMarker);
  const basePath = runtimeIndex >= 0
    ? pathname.slice(0, runtimeIndex + 1)
    : pathname.endsWith('/')
      ? pathname
      : pathname.slice(0, pathname.lastIndexOf('/') + 1);
  return `${window.location.origin}${basePath}${clean}`;
}
