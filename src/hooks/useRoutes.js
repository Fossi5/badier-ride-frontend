import { useAsync } from './useAsync';
import { getAllRoutes, getRoutesPaged } from '../api/routes';

export function useRoutes() {
  return useAsync(() => getAllRoutes());
}

export function useRoutesPaged(page = 0, size = 20) {
  return useAsync(() => getRoutesPaged(page, size), [page, size]);
}

export function useRoutesLive(intervalMs = 30000) {
  return useAsync(() => getAllRoutes(), [], intervalMs);
}
