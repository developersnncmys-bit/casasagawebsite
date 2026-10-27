// After a new version of the site goes live, a page that was already open (Instagram's
// browser keeps them around) asks for script files that no longer exist. Loading the page
// again picks up the new version — done once per minute so a real fault can't loop.
const KEY = "casasaga_reloaded_at";

export const isStaleVersion = (error) =>
  /ChunkLoadError|Loading (CSS )?chunk|dynamically imported module|Failed to fetch|Importing a module script failed|Load failed/i.test(
    `${error?.name || ""} ${error?.message || ""}`,
  );

export function reloadOnce() {
  try {
    const last = Number(sessionStorage.getItem(KEY)) || 0;
    if (Date.now() - last < 60000) return false;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    // Storage blocked: reload anyway — without it we can't tell, and once is the usual case
  }
  window.location.reload();
  return true;
}
