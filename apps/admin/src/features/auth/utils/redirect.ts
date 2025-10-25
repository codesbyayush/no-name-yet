export function getRedirectUrl(locationSearch: string, explicit?: string) {
  if (explicit) return explicit;

  const searchParams = new URLSearchParams(locationSearch);
  const redirectParam = searchParams.get('redirect');
  if (redirectParam) {
    return redirectParam.startsWith('http')
      ? redirectParam
      : `${window.location.origin}/${redirectParam}`;
  }

  return `${window.location.origin}/boards`;
}
