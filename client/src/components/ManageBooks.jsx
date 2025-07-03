import { useEffect, useState } from "react";
import { fetchWithAuth } from "../utils/fetchWithAuth";

function ManageBooks() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newBook, setNewBook] = useState({
        title: "",
        author: "",
        quantity: "",
        coverImage: null,
        bookPdf: null,
    });
    const [adding, setAdding] = useState(false);
    const [addError, setAddError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [editError, setEditError] = useState(null);
    const [updating, setUpdating] = useState(false);

    const fetchBooks = async () => {
        try {
            const res = await fetchWithAuth("/books");
            if (!res.ok) throw new Error("Failed to fetch books");
            const data = await res.json();
            setBooks(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load books.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    const handleAddBook = async () => {
        const { title, author, quantity, coverImage, bookPdf } = newBook;

        if (!title || !author || !quantity || !coverImage || !bookPdf) {
            setAddError("All fields, including files, are required.");
            return;
        }

        setAdding(true);
        setAddError(null);

        const formData = new FormData();
        formData.append("title", title);
        formData.append("author", author);
        formData.append("quantity", quantity);
        formData.append("coverImage", coverImage);
        formData.append("bookPdf", bookPdf);

        try {
            const res = await fetchWithAuth("/books/new", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to add book");
            }

            const added = await res.json();
            setBooks((prev) => [...prev, added]);
            setShowAddModal(false);
        } catch (err) {
            console.error(err);
            setAddError(err.message);
        } finally {
            setAdding(false);
            fetchBooks();
        }
    };

    const handleUpdateBook = async () => {
        const { title, author, quantity, _id } = editingBook;

        const updatePayload = {};
        if (title) updatePayload.title = title;
        if (author) updatePayload.author = author;
        if (quantity !== "") updatePayload.quantity = Number(quantity);

        if (Object.keys(updatePayload).length === 0) {
            setEditError("Please provide at least one field to update.");
            return;
        }

        setUpdating(true);
        setEditError(null);

        try {
            const res = await fetchWithAuth(`/books/edit/${_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatePayload),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to update book");
            }

            await fetchBooks();
            setShowEditModal(false);
        } catch (err) {
            console.error(err);
            setEditError(err.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteBook = async (bookId) => {
        if (!window.confirm("Are you sure you want to delete this book?"))
            return;

        try {
            const res = await fetchWithAuth(`/books/delete/${bookId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to delete book");
            }

            await fetchBooks();
        } catch (err) {
            console.error(err);
            alert("Error deleting book: " + err.message);
        }
    };

    if (loading) return <div>Loading books...</div>;
    if (error) return <div className="text-red-600">{error}</div>;

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold">Manage Books</h3>

            {/* Add Book Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-300/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
                        <h4 className="text-lg font-semibold mb-4">
                            Add New Book
                        </h4>

                        {addError && (
                            <p className="text-red-600 mb-2">{addError}</p>
                        )}

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleAddBook();
                            }}
                            className="space-y-3"
                            encType="multipart/form-data"
                        >
                            <input
                                type="text"
                                placeholder="Title"
                                className="w-full border p-2 rounded"
                                value={newBook.title}
                                onChange={(e) =>
                                    setNewBook({
                                        ...newBook,
                                        title: e.target.value,
                                    })
                                }
                            />
                            <input
                                type="text"
                                placeholder="Author"
                                className="w-full border p-2 rounded"
                                value={newBook.author}
                                onChange={(e) =>
                                    setNewBook({
                                        ...newBook,
                                        author: e.target.value,
                                    })
                                }
                            />
                            <input
                                type="number"
                                placeholder="Quantity"
                                className="w-full border p-2 rounded"
                                value={newBook.quantity}
                                onChange={(e) =>
                                    setNewBook({
                                        ...newBook,
                                        quantity: e.target.value,
                                    })
                                }
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cover Image
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full border p-2 rounded"
                                    onChange={(e) =>
                                        setNewBook({
                                            ...newBook,
                                            coverImage: e.target.files[0],
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Book PDF
                                </label>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    className="w-full border p-2 rounded"
                                    onChange={(e) =>
                                        setNewBook({
                                            ...newBook,
                                            bookPdf: e.target.files[0],
                                        })
                                    }
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 rounded border"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={adding}
                                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {adding ? "Adding..." : "Add Book"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Book Modal */}
            {showEditModal && editingBook && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
                        <h4 className="text-lg font-semibold mb-4">
                            Edit Book
                        </h4>

                        {editError && (
                            <p className="text-red-600 mb-2">{editError}</p>
                        )}

                        <div className="space-y-3">
                            <input
                                type="text"
                                className="w-full border p-2 rounded"
                                value={editingBook.title}
                                onChange={(e) =>
                                    setEditingBook({
                                        ...editingBook,
                                        title: e.target.value,
                                    })
                                }
                            />
                            <input
                                type="text"
                                className="w-full border p-2 rounded"
                                value={editingBook.author}
                                onChange={(e) =>
                                    setEditingBook({
                                        ...editingBook,
                                        author: e.target.value,
                                    })
                                }
                            />
                            <input
                                type="number"
                                className="w-full border p-2 rounded"
                                value={editingBook.quantity}
                                onChange={(e) =>
                                    setEditingBook({
                                        ...editingBook,
                                        quantity: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-4 py-2 rounded border"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateBook}
                                disabled={updating}
                                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {updating ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Book Button */}
            <div>
                <button
                    onClick={() => {
                        setNewBook({
                            title: "",
                            author: "",
                            quantity: "",
                            coverImage: null,
                            bookPdf: null,
                        });
                        setAddError(null);
                        setShowAddModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + Add New Book
                </button>
            </div>

            {/* Book List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {books.map((book) => (
                    <div
                        key={book._id}
                        className="border p-4 rounded shadow-sm bg-gray-50 flex justify-between items-center"
                    >
                        <div>
                            <h4 className="font-semibold">{book.title}</h4>
                            <p className="text-sm text-gray-600">
                                {book.author}
                            </p>
                            <p className="text-sm text-gray-500">
                                Quantity: {book.quantity}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setEditingBook(book);
                                    setEditError(null);
                                    setShowEditModal(true);
                                }}
                                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDeleteBook(book._id)}
                                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ManageBooks;
