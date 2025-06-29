import api from '@/services/api';
import { AxiosResponse } from 'axios';

export async function fetchStores(): Promise<AxiosResponse> {
  return await api.get('stores');
}

export async function fetchStoreById(id: string): Promise<AxiosResponse> {
  return await api.get(`stores/${id}`);
}

export async function fetchMyStore(): Promise<AxiosResponse> {
  return await api.get('stores/my-store');
}

export async function createStore(data: any): Promise<AxiosResponse> {
  return await api.post(`stores`, data);
}

export async function updateStore(id: string, data: any): Promise<AxiosResponse> {
  return await api.patch(`stores/${id}/my-store`, data);
}
