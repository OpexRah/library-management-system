function BookCard({ id, title, author, quantity, onIssue }) {
    const isAvailable = quantity > 0;

    return (
        <div className="bg-white/30 backdrop-blur-lg border border-white/40 p-5 rounded-2xl shadow-xl transition-all hover:shadow-2xl flex flex-col justify-between h-full">
            <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-1 drop-shadow-sm">
                    {title}
                </h3>
                <p className="text-gray-700 drop-shadow-sm">Author: {author}</p>
                <p
                    className={`mt-2 text-sm font-semibold ${
                        isAvailable ? "text-green-600" : "text-red-600"
                    }`}
                >
                    {isAvailable ? `${quantity} Available` : "Out of stock"}
                </p>
            </div>

            {onIssue && (
                <div className="mt-5 flex justify-center">
                    <button
                        onClick={() => onIssue(id)}
                        disabled={!isAvailable}
                        className={`px-4 py-2 rounded-xl font-medium text-sm shadow-md backdrop-blur-sm transition-all duration-200 ${
                            isAvailable
                                ? "bg-blue-500/80 hover:bg-blue-600/80 text-white"
                                : "bg-gray-300/50 text-gray-500 cursor-not-allowed"
                        }`}
                    >
                        Issue
                    </button>
                </div>
            )}
        </div>
    );
}

export default BookCard;
