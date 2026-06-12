import api from "./axios";

export const getAllAddresses = () => api.get("/addresses");
export const getAddressesPaged = (page = 0, size = 20) => api.get(`/addresses/paged?page=${page}&size=${size}`);
export const getAddressById = (id) => api.get(`/addresses/${id}`);
export const createAddress = (addressData) => api.post("/addresses", addressData);
export const updateAddress = (id, addressData) => api.put(`/addresses/${id}`, addressData);
export const deleteAddress = (id) => api.delete(`/addresses/${id}`);
