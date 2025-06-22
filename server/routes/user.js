import express from "express";
import protect from "../middlewares/protectRoute.js";
import {
    requestBook,
    viewIssuedBooks,
    viewPrevIssuedBooks,
    viewRejectedRequests,
    payFines,
    profile,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/request_book", protect, requestBook);
router.get("/view_issued", protect, viewIssuedBooks);
router.get("/view_history", protect, viewPrevIssuedBooks);
router.get("/view_rejected", protect, viewRejectedRequests);
router.post("/pay_fines", protect, payFines);
router.get("/profile", protect, profile);

export default router;
