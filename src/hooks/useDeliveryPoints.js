import { useAsync } from './useAsync';
import { getAllDeliveryPoints, getDeliveryPointsPaged } from '../api/deliveryPoints';

export function useDeliveryPoints() {
  return useAsync(() => getAllDeliveryPoints());
}

export function useDeliveryPointsPaged(page = 0, size = 20) {
  return useAsync(() => getDeliveryPointsPaged(page, size), [page, size]);
}
