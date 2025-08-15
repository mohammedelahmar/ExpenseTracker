// Normalize a file URL returned by the API into a browser-loadable URL
// - If it's absolute (http/https), return as-is
// - If it's a relative uploads path, ensure it begins with '/'
export function makeSafeUrl(u) {
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  return u.startsWith('/uploads/') ? u : `/${u}`;
}

export default makeSafeUrl;
