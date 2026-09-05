export function getDatabaseUrl(rawUrl: string | undefined, poolerRegion?: string): string {
  if (!rawUrl || !poolerRegion) return rawUrl ?? "";

  try {
    const url = new URL(rawUrl);
    const hostnameParts = url.hostname.split(".");
    const projectRef = hostnameParts[0] === "db" ? hostnameParts[1] : undefined;
    if (!projectRef) return rawUrl;

    url.hostname = `aws-0-${poolerRegion}.pooler.supabase.com`;
    url.port = "5432";
    url.username = `postgres.${projectRef}`;
    return url.toString();
  } catch {
    return rawUrl;
  }
}
