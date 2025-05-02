import axios from 'axios';

export const submitVoucher = async (type, data) => {
  return axios.post(`/api/voucher?type=${type}`, data); 
};
