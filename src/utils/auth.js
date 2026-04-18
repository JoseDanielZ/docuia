export function getUser() {
  try { return JSON.parse(localStorage.getItem("docuia_user") || "null"); } catch { return null; }
}

export function logout() {
  localStorage.removeItem("docuia_token");
  localStorage.removeItem("docuia_user");
  window.location.href = "/login.html";
}
