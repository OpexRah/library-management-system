import { useState } from "react";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import IssuedBooksList from "./IssuedBooksList";
import IssueRequests from "./IssueRequests";
import ManageBooks from "./ManageBooks";
import BooksTabLib from "./BooksTabLib";

function LibrarianDashboard() {
    const [activeTab, setActiveTab] = useState("books");

    const handleLogout = async () => {
        try {
            const res = await fetchWithAuth("/auth/logout", { method: "POST" });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Logout Failed");
            }
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/";
        } catch (err) {
            console.error(err);
            alert("Failed to logout.");
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "books":
                return <BooksTabLib />;
            case "issued":
                return <IssuedBooksList />;
            case "requests":
                return <IssueRequests />;
            case "manage":
                return <ManageBooks />;
            default:
                return null;
        }
    };

    const tabs = [
        { id: "books", label: "Books" },
        { id: "issued", label: "Issued Books" },
        { id: "requests", label: "Issue Requests" },
        { id: "manage", label: "Manage Books" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
            {/* Crystal Tab Bar */}
            <div className="fixed top-0 left-0 right-0 px-6 py-4 z-50 flex items-center justify-between backdrop-blur-md bg-white/30 border-b border-white/50 shadow-sm">
                <div className="w-24" />

                <div className="absolute left-1/2 transform -translate-x-1/2 flex gap-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-xl font-medium backdrop-blur-sm transition-all duration-200 ${
                                activeTab === tab.id
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "bg-white/40 text-gray-700 hover:bg-white/60"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-800 font-semibold transition"
                >
                    Logout
                </button>
            </div>

            {/* Content */}
            <div className="pt-28 px-4 max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold mb-8 text-center text-gray-700 drop-shadow-sm">
                    Librarian Dashboard
                </h2>

                <div className="backdrop-blur-lg bg-white/40 border border-white/50 rounded-3xl p-6 shadow-xl">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
}

export default LibrarianDashboard;
