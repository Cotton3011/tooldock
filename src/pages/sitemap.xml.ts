import toolsData from '../data/tools.json';
import type { APIRoute } from 'astro';
import type { Tool } from '../lib/tool-types';
import { categoryPaths } from '../lib/tool-types';

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://vtooldock.com');
  const paths = ['/', ...Object.values(categoryPaths), ...(toolsData as Tool[]).filter((tool) => tool.enabled).map((tool) => `${tool.path}/`)];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `\n  <url><loc>${new URL(path, base).href}</loc></url>`).join('')}\n</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
