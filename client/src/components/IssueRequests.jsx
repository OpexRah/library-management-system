import { useState, useEffect } from "react";
import { fetchWithAuth } from "../utils/fetchWithAuth";

function IssueRequests() {
    const [requests, setReqests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRequests = async () => {
        try {
            const res = await fetchWithAuth("/librarian/view_requests");
            if (!res.ok) throw new Error("Failed to fetch issue requests");
            const data = await res.json();
            setReqests(data);
        } catch (err) {
            console.error(err);
            setError("Could not load issue requests.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAccept = async (requestId) => {
        const fine = window.prompt("Enter fine amount:", "0");
        if (fine !== null) {
            console.log(`Fine entered for ${requestId}:`, fine);
            try {
                const res = await fetchWithAuth("/librarian/approve", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        request_id: requestId,
                        fine_amount: fine,
                    }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    //console.log(data);
                    alert(data.msg || "Approve failed");
                    return;
                }
                alert(`Approved request ${requestId} with fine: ${fine}`);
                fetchRequests();
            } catch (err) {
                console.error(err);
                alert("Could not approve request. Please try again.");
            }
        }
    };

    const handleDeny = async (requestId) => {
        const reason = window.prompt("Enter reason (if any):", "denied");
        if (reason !== null) {
            try {
                const res = await fetchWithAuth("/librarian/reject", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        request_id: requestId,
                        reason: reason,
                    }),
                });

                if (!res.ok) throw new Error("Denial Failed");
                alert(`Denied request ${requestId} with reason: ${reason}`);
                fetchRequests();
            } catch (err) {
                console.error(err);
                alert("Could not deny request. Please try again.");
            }
        }
    };

    if (loading) return <div>Loading issue requests...</div>;
    if (error) return <div className="text-red-600">{error}</div>;

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold">Pending Issue Requests</h3>

            {loading && <div>Loading issue requests...</div>}
            {error && <div className="text-red-600">{error}</div>}

            {!loading && !error && requests.length === 0 && (
                <div>No pending requests.</div>
            )}

            {!loading && !error && (
                <ul className="space-y-4">
                    {requests.map((req) => (
                        <li
                            key={req._id}
                            className="p-4 border rounded-lg bg-gray-50 shadow-sm flex justify-between items-start"
                        >
                            {/* Left Side: Request Info */}
                            <div>
                                <p>
                                    <span className="font-medium">Book:</span>{" "}
                                    {req.book_id?.title}
                                </p>
                                <p>
                                    <span className="font-medium">Author:</span>{" "}
                                    {req.book_id?.author}
                                </p>
                                <p>
                                    <span className="font-medium">
                                        Requested by:
                                    </span>{" "}
                                    {req.issuer?.username}
                                </p>
                                <p>
                                    <span className="font-medium">
                                        Duration:
                                    </span>{" "}
                                    {req.duration} days
                                </p>
                                <p className="text-sm text-gray-500">
                                    Requested on:{" "}
                                    {new Date(req.createdAt).toLocaleString(
                                        "en-GB",
                                        {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                            hour: "numeric",
                                            minute: "2-digit",
                                            hour12: false,
                                        }
                                    )}
                                </p>
                            </div>

                            {/* Right Side: Buttons */}
                            <div className="flex flex-col gap-2 ml-4">
                                <button
                                    className="px-4 py-2 bg-green-400 text-white rounded hover:bg-green-500 transition"
                                    onClick={() => handleAccept(req._id)}
                                >
                                    Accept
                                </button>
                                <button
                                    className="px-4 py-2 bg-red-400 text-white rounded hover:bg-red-500 transition"
                                    onClick={() => handleDeny(req._id)}
                                >
                                    Deny
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default IssueRequests;
