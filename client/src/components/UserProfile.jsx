import { useEffect, useState } from "react";
import { fetchWithAuth } from "../utils/fetchWithAuth";

function UserProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paying, setPaying] = useState(false);

    const getProfile = async () => {
        try {
            const res = await fetchWithAuth("/user/profile");
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to load profile");
            }

            setProfile(data);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getProfile();
    }, []);

    const handlePayFines = async () => {
        try {
            setPaying(true);
            const res = await fetchWithAuth("/user/pay_fines", {
                method: "POST",
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Payment failed");
            }

            alert("Fine paid successfully!");
            await getProfile(); // Refresh profile data
        } catch (err) {
            console.error(err);
            alert(err.message || "Failed to pay fine");
        } finally {
            setPaying(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center text-gray-600 text-lg">
                Loading profile...
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-600 text-lg">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-8 text-gray-800">
            <h3 className="text-2xl font-bold text-gray-700 drop-shadow">
                User Profile
            </h3>

            <div className="w-full max-w-xl bg-white/40 backdrop-blur-md border border-white/50 rounded-3xl p-8 shadow-xl space-y-6">
                <div className="flex justify-between text-lg">
                    <span className="font-medium text-gray-600">Username:</span>
                    <span className="text-black">{profile.username}</span>
                </div>

                <div className="flex justify-between text-lg">
                    <span className="font-medium text-gray-600">
                        Total Books Issued:
                    </span>
                    <span className="text-black">
                        {profile.total_issued_books}
                    </span>
                </div>

                <div className="flex justify-between text-lg items-center">
                    <span className="font-medium text-gray-600">
                        Pending Fines:
                    </span>
                    <span className="text-black">₹{profile.pending_fine}</span>
                </div>

                <div className="flex justify-between text-lg">
                    <span className="font-medium text-gray-600">
                        Currently Issued Books:
                    </span>
                    <span className="text-black">
                        {profile.currently_issued_books}
                    </span>
                </div>

                {profile.pending_fine > 0 && (
                    <div className="pt-4 text-center">
                        <button
                            onClick={handlePayFines}
                            disabled={paying}
                            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition disabled:opacity-50"
                        >
                            {paying ? "Processing..." : "Pay Fine"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserProfile;
