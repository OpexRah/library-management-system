import { useEffect, useState } from "react";
import BookCard from "./BookCard";
import { fetchWithAuth } from "../utils/fetchWithAuth";

function UserDashboard() {
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

    const handleIssueBook = async (bookId) => {
        try {
            const res = await fetchWithAuth("/user/request_book", {
                method: "POST",
                body: JSON.stringify({
                    book_id: bookId,
                    duration: 7, // hardcoded for now
                }),
            });

            if (res.status === 409) {
                alert("You have already issued this book.");
                return;
            }

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Request failed");
            }

            alert("Book request sent successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to request book.");
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
                                    onIssue={handleIssueBook}
                                />
                            ))
                        )}
                    </div>
                );
            case "requests":
                return <div> Book Requests (coming soon)</div>;
            case "issued":
                return <div> Issued Books (coming soon)</div>;
            case "history":
                return <div> History (coming soon)</div>;
            default:
                return null;
        }
    };

    const tabs = [
        { id: "books", label: "Books" },
        { id: "requests", label: "Book Requests" },
        { id: "issued", label: "Issued Books" },
        { id: "history", label: "History" },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-7xl">
                <h2 className="text-2xl font-bold mb-6 text-center">
                    User Dashboard
                </h2>

                <div className="flex justify-center flex-wrap gap-4 mb-6">
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

                <div className="bg-gray-50 rounded-md p-4 border">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
}

export default UserDashboard;
