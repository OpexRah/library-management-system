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
            console.log(data);

            if (data.access_token && data.refreshToken) {
                localStorage.setItem("access_token", data.access_token);
                localStorage.setItem("refresh_token", data.refresh_token);
                onLogin();
            } else {
                setError("Signup failed. Please try again.");
            }
        } catch (err) {
            setError(err.message || "Something went wrong.");
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-2xl shadow-md w-96"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">
                    Library Login
                </h2>

                {error && (
                    <div className="mb-4 text-red-600 text-sm text-center">
                        {error}
                    </div>
                )}

                <div className="mb-4">
                    <label className="block mb-1 text-sm font-medium">
                        Username
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label className="block mb-1 text-sm font-medium">
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition mb-3"
                >
                    Login
                </button>
                <button
                    type="button"
                    onClick={handleSignup}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                >
                    Signup
                </button>
            </form>
        </div>
    );
}

export default LoginScreen;
