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

            setIssuedBooks((prev) => prev.filter((e) => e._id !== entry._id));
        } catch (err) {
            console.error(err);
            alert("Could not mark book as returned.");
        }
    };

    if (loading)
        return (
            <div className="text-center text-gray-700">
                Loading issued books...
            </div>
        );
    if (error) return <div className="text-center text-red-600">{error}</div>;

    return (
        <div className="flex flex-col gap-6">
            {issuedBooks.length === 0 ? (
                <div className="text-center text-gray-600">
                    No books have been issued yet.
                </div>
            ) : (
                issuedBooks.map((entry) => (
                    <div
                        key={entry._id}
                        className="rounded-2xl border border-white/40 backdrop-blur-sm bg-white/30 shadow-md p-6 flex flex-col gap-4"
                    >
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-1">
                                {entry.book_id?.title || "Untitled Book"}
                            </h3>
                            <p className="text-sm text-gray-700">
                                <span className="font-medium">Author:</span>{" "}
                                {entry.book_id?.author || "Unknown"}
                            </p>
                            <p className="text-sm text-gray-700">
                                <span className="font-medium">Issued to:</span>{" "}
                                {entry.issuer_id?.username || "Unknown"}
                            </p>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Issue Date:</span>{" "}
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
                                <span className="font-medium">
                                    Fine Per Day:
                                </span>{" "}
                                ₹{entry.fine ?? 0}
                            </p>
                        </div>

                        <div className="text-right">
                            <button
                                onClick={() => handleMarkAsReturned(entry)}
                                className="px-4 py-2 text-sm font-semibold rounded-xl bg-blue-600 text-white shadow hover:bg-blue-700 transition"
                            >
                                Mark Returned
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default IssuedBooksList;
