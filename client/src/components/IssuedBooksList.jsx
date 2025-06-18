import { useEffect, useState } from "react";
import { fetchWithAuth } from "../utils/fetchWithAuth";

function IssuedBooksList() {
    const [issuedBooks, setIssuedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchIssuedBooks = async () => {
            try {
                const res = await fetchWithAuth("/librarian/view_issued");
                if (!res.ok) throw new Error("Failed to fetch issued books");
                const data = await res.json();
                setIssuedBooks(data);
            } catch (err) {
                console.error(err);
                setError("Could not load issued books.");
            } finally {
                setLoading(false);
            }
        };

        fetchIssuedBooks();
    }, []);

    const handleMarkAsReturned = async (entry) => {
        const confirmReturn = window.confirm("Mark this book as returned?");
        if (!confirmReturn) return;

        try {
            const res = await fetchWithAuth(`/librarian/mark_return`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    book_id: entry.book_id?._id,
                    issuer_id: entry.issuer_id?._id,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to mark as returned");
            }

            // Remove returned entry from list
            setIssuedBooks((prev) => prev.filter((e) => e._id !== entry._id));
        } catch (err) {
            console.error(err);
            alert("Could not mark book as returned.");
        }
    };

    if (loading) return <div>Loading issued books...</div>;
    if (error) return <div className="text-red-600">{error}</div>;

    return (
        <div className="flex flex-col gap-4">
            {issuedBooks.length === 0 ? (
                <div>No books have been issued yet.</div>
            ) : (
                issuedBooks.map((entry) => (
                    <div
                        key={entry._id}
                        className="border rounded-xl p-4 bg-white shadow flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center"
                    >
                        <div>
                            <h3 className="text-lg font-semibold mb-1">
                                {entry.book_id?.title || "Untitled Book"}
                            </h3>
                            <p className="text-sm text-gray-700">
                                Author: {entry.book_id?.author || "Unknown"}
                            </p>
                            <p className="text-sm text-gray-700">
                                Issued to:{" "}
                                {entry.issuer_id?.username || "Unknown"}
                            </p>
                            <p className="text-sm text-gray-600">
                                Issue Date:{" "}
                                {new Date(entry.createdAt).toLocaleDateString()}
                            </p>
                            <p
                                className={`text-sm font-medium ${
                                    new Date(entry.expected_return) < new Date()
                                        ? "text-red-600"
                                        : "text-green-600"
                                }`}
                            >
                                Expected Return:{" "}
                                {new Date(
                                    entry.expected_return
                                ).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">
                                Fine Per Day: ₹{entry.fine ?? 0}
                            </p>
                        </div>

                        <button
                            onClick={() => handleMarkAsReturned(entry)}
                            className="self-center px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                        >
                            Mark Returned
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}

export default IssuedBooksList;
