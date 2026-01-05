export function getApiHeaders(): HeadersInit {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept-Language': localStorage.getItem('locale') || 'en',
    };

    const token = localStorage.getItem("authToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

  return headers;
}
