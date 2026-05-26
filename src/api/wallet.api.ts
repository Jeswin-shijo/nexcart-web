import client from './client';

export const getWallet = () => client.get('/wallet').then((r) => r.data);

export const adminCredit = (userId: string, data: any) =>
  client.post(`/wallet/credit?userId=${userId}`, data).then((r) => r.data);
