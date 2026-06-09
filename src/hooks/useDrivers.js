import { useAsync } from './useAsync';
import { getAllDrivers, getAvailableDrivers } from '../api/drivers';

export function useDrivers() {
  return useAsync(() => getAllDrivers());
}

export function useAvailableDrivers() {
  return useAsync(() => getAvailableDrivers());
}
