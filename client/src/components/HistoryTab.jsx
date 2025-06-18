import { useEffect, useState } from "react";
import HistoryCard from "./HistoryCard";
import { fetchWithAuth } from "../utils/fetchWithAuth";

export default function HistoryTab() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetchWithAuth("/user/view_history");
                if (!res.ok) throw new Error("Failed to fetch history");
                const data = await res.json();
                setHistory(data);
            } catch (err) {
                console.error(err);
                setError("Could not load history.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) return <div>Loading history...</div>;
    if (error) return <div className="text-red-600">{error}</div>;

    return (
        <div className="flex flex-col gap-4">
            {history.length === 0 ? (
                <div>No history available.</div>
            ) : (
                history.map((entry) => (
                    <HistoryCard
                        key={entry._id}
                        title={entry.book_id?.title || "Unknown Title"}
                        author={entry.book_id?.author || "Unknown Author"}
                        issueDate={entry.issue_date}
                        returnDate={entry.return_date}
                        approval={entry.approval}
                        returnStatus={entry.return_status}
                    />
                ))
            )}
        </div>
    );
}
