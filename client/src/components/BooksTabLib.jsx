import { useEffect, useState } from "react";
import BookCard from "./BookCard";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { useDebounce } from "../hooks/useDebounce";

export default function BooksTabLib() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 400);

    useEffect(() => {
        const controller = new AbortController();

        const fetchBooks = async () => {
            try {
                setLoading(true);
                setError(null);
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

    return (
        <div className="backdrop-blur-lg bg-white/30 border border-white/40 rounded-2xl p-6 shadow-xl">
            {/* Search bar */}
            <div className="mb-6 flex justify-center w-full">
                <input
                    type="text"
                    placeholder="Search books..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-96 px-4 py-2 bg-white/50 text-gray-800 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-300 backdrop-blur-sm placeholder-gray-600"
                />
            </div>

            {/* Book Grid or Status */}
            {loading ? (
                <div className="text-center text-gray-700">
                    Loading books...
                </div>
            ) : error ? (
                <div className="text-center text-red-700 bg-red-100/60 px-4 py-2 rounded-md">
                    {error}
                </div>
            ) : books.length === 0 ? (
                <div className="text-center text-gray-600">
                    No books available.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {books.map((book) => (
                        <BookCard
                            key={book._id}
                            id={book._id}
                            title={book.title}
                            author={book.author}
                            quantity={book.quantity}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
