import { useEffect, useState } from "react";
import { fetchWithAuth } from "../utils/fetchWithAuth";

function IssuedTab() {
    const [issuedBooks, setIssuedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchIssuedBooks = async () => {
            try {
                const res = await fetchWithAuth("/user/view_issued");
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

    if (loading) {
        return (
            <div className="text-center text-gray-700 py-6">
                Loading issued books...
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-700 bg-red-100/70 px-4 py-2 rounded-lg">
                {error}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {issuedBooks.length === 0 ? (
                <div className="col-span-full text-center text-gray-600">
                    No books have been issued yet.
                </div>
            ) : (
                issuedBooks.map((entry) => {
                    const isOverdue =
                        new Date(entry.expected_return) < new Date();

                    return (
                        <div
                            key={entry._id}
                            className="bg-white/70 backdrop-blur-sm border border-gray-300 rounded-xl p-5 shadow-md hover:shadow-lg transition"
                        >
                            <h3 className="text-lg font-semibold mb-1 text-gray-800">
                                {entry.book_id?.title || "Untitled Book"}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                                Author: {entry.book_id?.author || "Unknown"}
                            </p>
                            <p className="text-sm text-gray-700">
                                <span className="font-medium">Issue Date:</span>{" "}
                                {new Date(entry.createdAt).toLocaleDateString()}
                            </p>
                            <p
                                className={`text-sm font-medium ${
                                    isOverdue ? "text-red-600" : "text-gray-700"
                                }`}
                            >
                                Expected Return:{" "}
                                {new Date(
                                    entry.expected_return
                                ).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-700">
                                Fine Per Day:{" "}
                                <span className="font-semibold">
                                    ₹{entry.fine ?? 0}
                                </span>
                            </p>
                        </div>
                    );
                })
            )}
        </div>
    );
}

export default IssuedTab;
