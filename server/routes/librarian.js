import express from "express";
import protect from "../middlewares/protectRoute.js";
import {
    viewIssueRequests,
    approveRequest,
    rejectRequest,
    viewAllIssuedBooks,
    viewDefaulters,
    markReturned,
} from "../controllers/librarianController.js";

const router = express.Router();
router.get("/view_requests", protect, viewIssueRequests);
router.post("/approve", protect, approveRequest);
router.post("/reject", protect, rejectRequest);
router.get("/view_issued", protect, viewAllIssuedBooks);
router.get("/view_defaulters", protect, viewDefaulters);
router.post("/mark_return", protect, markReturned);

export default router;
