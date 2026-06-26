
function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days*24*60*60*1000).toUTCString();
  // ถ้าคุณจะเปิดบนหลายโดเมน/ซับโดเมน ให้ใช้โดเมนหลัก .ptknetwork.com
  // หมายเหตุ: ถ้าเป็น IP (10.x.x.x) จะตั้ง Domain ข้าม host ไม่ได้
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Expires=${expires}; Secure; SameSite=Lax`;
}

export function migrateAuthToCookie() {
  const emp = localStorage.getItem('auth_empno');
  const adu = localStorage.getItem('auth_aduser');
  if (emp) setCookie('auth_empno', emp);
  if (adu) setCookie('auth_aduser', adu);
}