import { useEffect, useState } from "react";
import BookCard from "./BookCard";
import { fetchWithAuth } from "../utils/fetchWithAuth";

export default function BooksTab() {
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

        fetchBooks();
    }, []);

    const handleIssueBook = async (bookId) => {
        try {
            const res = await fetchWithAuth("/user/request_book", {
                method: "POST",
                body: JSON.stringify({
                    book_id: bookId,
                    duration: 7,
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
}
