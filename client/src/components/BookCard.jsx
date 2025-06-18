function BookCard({ id, title, author, quantity, onIssue }) {
    return (
        <div className="bg-white p-4 rounded-xl shadow hover:shadow-md transition flex flex-col justify-between h-full">
            <div>
                <h3 className="text-lg font-semibold mb-1">{title}</h3>
                <p className="text-gray-600">Author: {author}</p>
                <p
                    className={`mt-2 text-sm font-semibold ${
                        quantity > 0 ? "text-green-600" : "text-red-600"
                    }`}
                >
                    {quantity > 0 ? `${quantity} Available` : "Out of stock"}
                </p>
            </div>

            <div className="mt-4 flex justify-center">
                <button
                    onClick={() => onIssue(id)}
                    disabled={quantity === 0}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                        quantity > 0
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                >
                    Issue
                </button>
            </div>
        </div>
    );
}

export default BookCard;
