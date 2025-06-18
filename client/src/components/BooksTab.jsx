import { useEffect, useState } from "react";
import BookCard from "./BookCard";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { useDebounce } from "../hooks/useDebounce";

export default function BooksTab() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 400); // Debounce delay

    useEffect(() => {
        const controller = new AbortController();

        const fetchBooks = async () => {
            setLoading(true);
            setError(null);
            try {
                const endpoint = debouncedSearchTerm.trim()
                    ? `/books/search?query=${encodeURIComponent(
                          debouncedSearchTerm
                      )}`
                    : "/books";

                const res = await fetchWithAuth(endpoint, {
                    signal: controller.signal,
                });

                if (!res.ok) throw new Error("Failed to fetch books");

                const data = await res.json();
                setBooks(data);
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error(err);
                    setError("Could not load books.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();

        return () => controller.abort();
    }, [debouncedSearchTerm]);

    const handleIssueBook = async (bookId) => {
        try {
            const durationInput = window.prompt(
                "Enter the duration (in days):",
                "7"
            );
            if (!durationInput) return; // Cancelled

            const duration = parseInt(durationInput, 10);
            if (isNaN(duration) || duration <= 0) {
                alert("Please enter a valid number of days.");
                return;
            }

            const res = await fetchWithAuth("/user/request_book", {
                method: "POST",
                body: JSON.stringify({
                    book_id: bookId,
                    duration,
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

    return (
        <div>
            {/* Search Bar */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search books..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-96 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Book Grid */}
            {loading ? (
                <div>Loading books...</div>
            ) : error ? (
                <div className="text-red-600">{error}</div>
            ) : books.length === 0 ? (
                <div>No books found.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {books.map((book) => (
                        <BookCard
                            key={book._id}
                            id={book._id}
                            title={book.title}
                            author={book.author}
                            quantity={book.quantity}
                            onIssue={handleIssueBook}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
