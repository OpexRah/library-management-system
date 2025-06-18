const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const decodeJWT = (token) => {
    try {
        return JSON.parse(atob(token.split(".")[1]));
    } catch {
        return null;
    }
};

const isTokenExpired = (token) => {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
};

const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return null;

    try {
        const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${refreshToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) return null;

        const data = await res.json();
        localStorage.setItem("access_token", data.access_token);
        return data.access_token;
    } catch {
        return null;
    }
};

export const fetchWithAuth = async (url, options = {}) => {
    let accessToken = localStorage.getItem("access_token");

    if (!accessToken || isTokenExpired(accessToken)) {
        accessToken = await refreshAccessToken();

        if (!accessToken) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            throw new Error("Authentication required");
        }
    }

    const headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
    };

    return fetch(`${BACKEND_URL}${url}`, {
        ...options,
        headers,
    });
};
