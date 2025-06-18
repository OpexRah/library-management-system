function HistoryCard({
    title,
    author,
    issueDate,
    returnDate,
    approval,
    returnStatus,
}) {
    const today = new Date();
    const expectedReturn = returnDate ? new Date(returnDate) : null;

    let returnText = "";
    let returnClass = "";

    if (returnStatus) {
        returnText = "Returned";
        returnClass = "text-green-600 font-medium";
    } else if (expectedReturn) {
        if (expectedReturn >= today) {
            returnText = `Expected Return: ${expectedReturn.toLocaleDateString()}`;
            returnClass = "text-yellow-600 font-medium";
        } else {
            returnText = `Expected Return: ${expectedReturn.toLocaleDateString()}`;
            returnClass = "text-red-600 font-medium";
        }
    }

    return (
        <div className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
            <div>
                <h3 className="text-lg font-semibold mb-1">{title}</h3>
                <p className="text-gray-600">Author: {author}</p>
                <p className="text-sm text-gray-500 mt-1">
                    Issued: {new Date(issueDate).toLocaleDateString()}
                </p>
                {returnDate && (
                    <p className={`text-sm mt-1 ${returnClass}`}>
                        {returnText}
                    </p>
                )}
            </div>

            <div
                className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    approval === "approved"
                        ? "bg-green-100 text-green-700"
                        : approval === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                }`}
            >
                {approval.charAt(0).toUpperCase() + approval.slice(1)}
            </div>
        </div>
    );
}

export default HistoryCard;
