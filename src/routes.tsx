// @ts-expect-error: virtual module provided by react-pages
import routes from "~react-pages";
import { RouteObject, useRoutes, Navigate } from "react-router-dom";

// Clean a single route object: remove any 'components' key and recursively clean children.
// Returns `null` if the route is empty (no element, no index, and no children).
function stripComponentsFromRoute(route: unknown): RouteObject | null {
  if (!route || typeof route !== 'object') return null;
  const out: Record<string, unknown> = {};

  for (const [k, v] of Object.entries(route as Record<string, unknown>)) {
    if (k === 'components') continue;

    if (k === 'children' && Array.isArray(v)) {
      const children = v
        .map(stripComponentsFromRoute)
        .filter((c): c is RouteObject => c != null)
        // remove any child route whose path is literally 'components'
        .filter(child => child.path !== 'components');

      if (children.length > 0) out.children = children;
    } else {
      out[k] = v;
    }
  }

  // Keep the route if it has an element, an index flag, or remaining children
  if (out.element || out.index || (Array.isArray(out.children) && out.children.length > 0)) {
    return out as RouteObject;
  }

  // otherwise drop it
  return null;
}

function cleanRoutes(input: unknown): RouteObject[] {
  const arr = Array.isArray(input) ? input : [input];
  return arr
    .map(stripComponentsFromRoute)
    .filter((r): r is RouteObject => r != null);
}

export default function Router() {
  // produce a typed, cleaned RouteObject[] with all `components` keys removed
  const cleanedRoutes = cleanRoutes(routes);

  // console.log("Cleaned Routes:", cleanedRoutes);

  // Add a catch-all redirect for any unmatched path
  const withFallback: RouteObject[] = [
    ...cleanedRoutes,
    { path: "*", element: <Navigate to="/" replace /> },
  ];

  return useRoutes(withFallback);
}


