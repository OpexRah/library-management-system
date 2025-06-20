import { useState } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function LoginScreen({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch(`${BACKEND_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error("Invalid credentials");
            }

            const data = await response.json();

            if (data.access_token && data.refresh_token) {
                localStorage.setItem("access_token", data.access_token);
                localStorage.setItem("refresh_token", data.refresh_token);
                onLogin();
            } else {
                setError("Login failed. Please try again.");
            }
        } catch (err) {
            setError(err.message || "Something went wrong.");
        }
    };

    const handleSignup = async () => {
        setError("");

        try {
            const response = await fetch(`${BACKEND_URL}/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Signup failed");
            }

            const data = await response.json();

            if (data.access_token && data.refreshToken) {
                localStorage.setItem("access_token", data.access_token);
                localStorage.setItem("refresh_token", data.refreshToken);
                onLogin();
            } else {
                setError("Signup failed. Please try again.");
            }
        } catch (err) {
            setError(err.message || "Something went wrong.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 px-4">
            <form
                onSubmit={handleSubmit}
                className="backdrop-blur-lg bg-white/30 border border-white/40 shadow-2xl rounded-3xl px-8 py-10 w-full max-w-md"
            >
                <h2 className="text-3xl font-bold text-center text-gray-600 drop-shadow-sm mb-6">
                    Library Login
                </h2>

                {error && (
                    <div className="mb-4 bg-red-200/50 border border-red-400 text-red-800 px-4 py-2 rounded-md text-sm text-center backdrop-blur-sm">
                        {error}
                    </div>
                )}

                <div className="mb-4">
                    <label className="block mb-1 text-sm font-medium text-gray-600 drop-shadow-sm">
                        Username
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-2 bg-white/60 text-gray-800 rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-300 backdrop-blur-sm"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block mb-1 text-sm font-medium text-gray-600 drop-shadow-sm">
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 bg-white/60 text-gray-800 rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-300 backdrop-blur-sm"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-500/80 hover:bg-blue-600/80 text-white font-medium py-2 rounded-xl transition-all duration-200 shadow-md backdrop-blur-sm"
                >
                    Login
                </button>

                <button
                    type="button"
                    onClick={handleSignup}
                    className="mt-3 w-full bg-purple-500/80 hover:bg-purple-600/80 text-white font-medium py-2 rounded-xl transition-all duration-200 shadow-md backdrop-blur-sm"
                >
                    Signup
                </button>
            </form>
        </div>
    );
}

export default LoginScreen;
