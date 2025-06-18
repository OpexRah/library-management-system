import { useEffect, useState } from "react";
import BookCard from "./BookCard";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import IssuedBooksList from "./IssuedBooksList";
import IssueRequests from "./IssueRequests";

function LibrarianDashboard() {
    const [activeTab, setActiveTab] = useState("books");
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const res = await fetchWithAuth("/books");
                if (!res.ok) throw new Error("Failed to fetch books");
                const data = await res.json();
                setBooks(data);
            } catch (err) {
                console.error(err);
                setError("Could not load books.");
            } finally {
                setLoading(false);
            }
        };

        if (activeTab === "books") {
            fetchBooks();
        }
    }, [activeTab]);

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
                if (loading) return <div>Loading books...</div>;
                if (error) return <div className="text-red-600">{error}</div>;

                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {books.length === 0 ? (
                            <div>No books available.</div>
                        ) : (
                            books.map((book) => (
                                <BookCard
                                    key={book._id}
                                    id={book._id}
                                    title={book.title}
                                    author={book.author}
                                    quantity={book.quantity}
                                />
                            ))
                        )}
                    </div>
                );
            case "issued":
                return <IssuedBooksList />;
            case "requests":
                return <IssueRequests />;
            case "manage":
                return <div> Manage Books (coming soon)</div>;
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
        <div className="min-h-screen bg-gray-100">
            {/* Fixed Tab Bar */}
            <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 px-6 py-3 flex items-center justify-between">
                {/* Left Spacer to balance the absolute center */}
                <div className="w-24" />

                {/* Tabs Centered */}
                <div className="absolute left-1/2 transform -translate-x-1/2 flex gap-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                activeTab === tab.id
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Logout Button on Right */}
                <button
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-800 font-medium"
                >
                    Logout
                </button>
            </div>

            {/* Content (with top padding) */}
            <div className="pt-24 px-4 max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-center">
                    Librarian Dashboard
                </h2>

                <div className="bg-white rounded-md p-6 shadow-md">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
}

export default LibrarianDashboard;
