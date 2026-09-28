// Prefix public/ asset paths with the deployment base path (e.g. /Spotify-Clone on GitHub Pages).
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${path}`;
