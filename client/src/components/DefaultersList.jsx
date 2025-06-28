import React, { useEffect, useState } from "react";
import { fetchWithAuth } from "../utils/fetchWithAuth";

function DefaultersList() {
    const [defaulters, setDefaulters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [noDefaulters, setNoDefaulters] = useState(false);

    useEffect(() => {
        const fetchDefaulters = async () => {
            try {
                const res = await fetchWithAuth("/librarian/view_defaulters");
                if (!res.ok) {
                    throw new Error("Failed to fetch defaulters");
                }
                const data = await res.json();
                if (Array.isArray(data)) {
                    setDefaulters(data);
                } else if (data.message === "No defaulters found") {
                    setNoDefaulters(true);
                } else {
                    throw new Error("Unexpected response format");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDefaulters();
    }, []);

    if (loading) return <div>Loading defaulters...</div>;
    if (error) return <div className="text-red-600">{error}</div>;

    return (
        <div>
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
                Defaulters
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 rounded-xl overflow-hidden text-sm shadow-md">
                    <thead className="bg-blue-100 text-gray-800">
                        <tr>
                            <th className="px-4 py-3 text-left">Username</th>
                            <th className="px-4 py-3 text-left">Book Title</th>
                            <th className="px-4 py-3 text-center">Due Date</th>
                            <th className="px-4 py-3 text-center">
                                Overdue (days)
                            </th>
                            <th className="px-4 py-3 text-center">
                                Fine / Day
                            </th>
                            <th className="px-4 py-3 text-center">
                                Total Fine
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {noDefaulters || defaulters.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="6"
                                    className="px-4 py-6 text-center text-gray-500 italic"
                                >
                                    None
                                </td>
                            </tr>
                        ) : (
                            defaulters.map((record, index) => {
                                const dueDate = new Date(
                                    record.expected_return
                                );
                                const today = new Date();
                                const daysOverdue = Math.max(
                                    Math.floor(
                                        (today - dueDate) /
                                            (1000 * 60 * 60 * 24)
                                    ),
                                    0
                                );
                                const totalFine = daysOverdue * record.fine;

                                return (
                                    <tr
                                        key={index}
                                        className="hover:bg-blue-50 transition"
                                    >
                                        <td className="px-4 py-3">
                                            {record.issuer_id?.username ||
                                                "N/A"}
                                        </td>
                                        <td className="px-4 py-3">
                                            {record.book_id?.title || "Unknown"}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {dueDate.toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {daysOverdue}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            ₹{record.fine}
                                        </td>
                                        <td className="px-4 py-3 text-center text-red-600 font-semibold">
                                            ₹{totalFine}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DefaultersList;
