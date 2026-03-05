/**
 * Wraps an external image URL through our internal proxy to avoid CORS/403 issues
 * with Instagram CDN images. Returns the original URL if it's already local or a fallback.
 */
export function proxyImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  // Don't proxy local URLs, data URIs, or ui-avatars fallbacks
  if (url.startsWith('/') || url.startsWith('data:') || url.includes('ui-avatars.com')) {
    return url;
  }
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}
