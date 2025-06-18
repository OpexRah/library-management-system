import { useEffect, useState } from "react";
import LoginScreen from "./components/LoginScreen";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function App() {
    const [screen, setScreen] = useState("loading");

    useEffect(() => {
        const validateTokens = async () => {
            const access_token = localStorage.getItem("access_token");
            const refresh_token = localStorage.getItem("refresh_token");

            if (access_token) {
                const valid = await isAccessTokenValid(access_token);
                if (valid) {
                    setScreen("dashboard");
                    return;
                }
            }

            if (refresh_token) {
                const new_token = await refreshAccessToken(refresh_token);
                if (new_token) {
                    localStorage.setItem("access_token", new_token);
                    setScreen("dashboard");
                    return;
                }
            }

            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            setScreen("login");
        };
        validateTokens();
    }, []);

    const isAccessTokenValid = async (token) => {
        try {
            const res = await fetch(`${BACKEND_URL}/auth/validate`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            return res.ok;
        } catch {
            return false;
        }
    };

    const refreshAccessToken = async (refresh_token) => {
        try {
            const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${refresh_token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) return null;

            const data = await res.json();
            return data.access_token;
        } catch {
            return null;
        }
    };

    return (
        <>
            {screen === "login" && (
                <LoginScreen onLogin={() => setScreen("dashboard")} />
            )}
            {screen === "dashboard" && <div>Welcome to the dashboard!</div>}
        </>
    );
}

export default App;
