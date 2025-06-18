import { useState } from "react";
import LoginScreen from "./components/LoginScreen";

function App() {
    const [screen, setScreen] = useState("login");

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
