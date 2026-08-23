import { Debt } from '../types';

export interface CMFSyncResult {
  rut: string;
  fullName?: string;
  reportDate: string;
  totalDirectDebt: number;
  totalIndirectDebt: number;
  totalOverdueDebt: number;
  debts: Omit<Debt, 'id'>[];
}

export const CLAVE_UNICA_CMF_AUTH_URL = "https://accounts.claveunica.gob.cl/accounts/login/?next=/openid/authorize%3Ftipo_clave%3DCU%26aplicacion%3Dctd%26response_type%3Dcode%26state%3DCU%3Actd%3Acc60d652-c157-4d15-b68f-0beb7b30a9cc%26client_id%3D6a322ad743e3464bae56d2d9b180078a%26redirect_uri%3Dhttps%3A//orquestador.cmfchile.cl/conocetudeuda/clave_unica/redirect/%26scope%3Dopenid%2Brun%2Bname";

// Helper to format Chilean RUT with dots and dash
export const formatRut = (rut: string): string => {
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length <= 1) return clean;
  
  const dv = clean.slice(-1);
  let body = clean.slice(0, -1);
  
  // Format body with dots
  let formatted = '';
  while (body.length > 3) {
    formatted = '.' + body.slice(-3) + formatted;
    body = body.slice(0, -3);
  }
  formatted = body + formatted;
  
  return `${formatted}-${dv}`;
};

export const validateRut = (rut: string): boolean => {
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 8) return false;
  return true;
};
