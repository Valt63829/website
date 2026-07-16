import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

// ============================
// Create Report
// ============================

export const createReport = async ({
    reporterId,
    reporterName,
    reportedUserId,
    reportedUserName,
    contentId = "",
    contentType = "user",
    reason,
    description = "",
}) => {
    try {
        await addDoc(collection(db, "reports"), {
            reporterId,
            reporterName,
            reportedUserId,
            reportedUserName,
            contentId,
            contentType,
            reason,
            description,
            status: "pending",
            createdAt: serverTimestamp(),
            reviewedBy: null,
            reviewedAt: null,
        });

        return true;
    } catch (error) {
        console.error("createReport:", error);
        throw error;
    }
};

// ============================
// Listen Reports
// ============================

export const listenToReports = (callback) => {
    const q = query(
        collection(db, "reports"),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const reports = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            callback(reports);
        },
        (error) => {
            console.error(
                "listenToReports:",
                error
            );
        }
    );
};

// ============================
// Resolve Report
// ============================

export const resolveReport = async (
    reportId,
    ownerUid
) => {
    try {
        await updateDoc(
            doc(db, "reports", reportId),
            {
                status: "resolved",
                reviewedBy: ownerUid,
                reviewedAt: serverTimestamp(),
            }
        );
    } catch (error) {
        console.error(
            "resolveReport:",
            error
        );
    }
};

// ============================
// Dismiss Report
// ============================

export const dismissReport = async (
    reportId,
    ownerUid
) => {
    try {
        await updateDoc(
            doc(db, "reports", reportId),
            {
                status: "dismissed",
                reviewedBy: ownerUid,
                reviewedAt: serverTimestamp(),
            }
        );
    } catch (error) {
        console.error(
            "dismissReport:",
            error
        );
    }
};

// ============================
// Delete Report
// ============================

export const deleteReport = async (
    reportId
) => {
    try {
        await deleteDoc(
            doc(db, "reports", reportId)
        );
    } catch (error) {
        console.error(
            "deleteReport:",
            error
        );
    }
};