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
                console.log(data);
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
                        className="border rounded-lg p-4 bg-gray-50 shadow-sm"
                    >
                        <div className="font-semibold">
                            {entry.book_id?.title || "Untitled Book"}
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                            Author: {entry.book_id?.author || "Unknown"}
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                            Issued to: {entry.issuer_id?.username || "Unknown"}
                        </div>
                        <div className="text-sm text-gray-600">
                            Issue Date:{" "}
                            {new Date(entry.createdAt).toLocaleDateString()}
                        </div>
                        <div
                            className={`text-sm ${
                                new Date(entry.expected_return) < new Date()
                                    ? "text-red-600"
                                    : "text-gray-600"
                            }`}
                        >
                            Expected Return:{" "}
                            {new Date(
                                entry.expected_return
                            ).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-600">
                            Fine Per Day: ₹{entry.fine ?? 0}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default IssuedBooksList;
