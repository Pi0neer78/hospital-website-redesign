const STAFF_TOKEN_KEY = 'staff_token';

export const getStaffToken = () => localStorage.getItem(STAFF_TOKEN_KEY) || '';

export const saveStaffToken = (token?: string) => {
  localStorage.setItem(STAFF_TOKEN_KEY, token || '');
};

export const clearStaffToken = () => localStorage.removeItem(STAFF_TOKEN_KEY);

export async function staffFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    headers: { ...(init.headers || {}), 'X-Staff-Token': getStaffToken() },
  });
  if (res.status === 401) {
    localStorage.removeItem('doctor_auth');
    localStorage.removeItem('registrar_auth');
    clearStaffToken();
    window.location.reload();
  }
  return res;
}
