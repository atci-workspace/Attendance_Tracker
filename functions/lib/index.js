"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAdminSecretPhrase = exports.pruneAttendanceByDateRange = exports.adminAddOrRemoveAdmin = exports.upsertMember = exports.markSpecificDates = exports.markAttendanceRange = exports.markTodayAttendance = void 0;
const https_1 = require("firebase-functions/https");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
function assertAccenture(email) {
    if (!email || !email.endsWith('@accenture.com')) {
        throw new https_1.HttpsError('permission-denied', 'Only @accenture.com users are allowed.');
    }
}
exports.markTodayAttendance = (0, https_1.onCall)(async (req) => {
    assertAccenture(req.auth?.token.email);
    const uid = String(req.data.uid ?? '');
    const status = String(req.data.status ?? 'AB');
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const docId = `${uid}_${now.getFullYear()}_${month}`;
    await db.collection('attendance').doc(docId).set({
        uid,
        year: now.getFullYear(),
        month: Number(month),
        attendanceData: { [day]: status },
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
        updatedBy: req.auth?.uid ?? null,
    }, { merge: true });
    return { ok: true };
});
exports.markAttendanceRange = (0, https_1.onCall)(async (req) => {
    assertAccenture(req.auth?.token.email);
    const uid = String(req.data.uid ?? '');
    const status = String(req.data.status ?? 'AB');
    const fromDate = String(req.data.fromDate ?? '');
    const toDate = String(req.data.toDate ?? '');
    if (!uid || !fromDate || !toDate) {
        throw new https_1.HttpsError('invalid-argument', 'uid, fromDate and toDate are required.');
    }
    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
        throw new https_1.HttpsError('invalid-argument', 'Invalid date range.');
    }
    const updates = new Map();
    for (const dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
        const weekday = dt.getDay();
        if (weekday === 0 || weekday === 6)
            continue;
        const year = dt.getFullYear();
        const month = dt.getMonth() + 1;
        const day = String(dt.getDate()).padStart(2, '0');
        const docId = `${uid}_${year}_${String(month).padStart(2, '0')}`;
        const existing = updates.get(docId) ?? { uid, year, month, attendanceData: {} };
        existing.attendanceData[day] = status;
        updates.set(docId, existing);
    }
    const batch = db.batch();
    updates.forEach((value, docId) => {
        const ref = db.collection('attendance').doc(docId);
        batch.set(ref, {
            ...value,
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
            updatedBy: req.auth?.uid ?? null,
        }, { merge: true });
    });
    await batch.commit();
    return { ok: true, docsUpdated: updates.size };
});
exports.markSpecificDates = (0, https_1.onCall)(async (req) => {
    assertAccenture(req.auth?.token.email);
    const uid = String(req.data.uid ?? '');
    const status = String(req.data.status ?? 'AB');
    const year = Number(req.data.year ?? 0);
    const month = Number(req.data.month ?? 0);
    const dates = Array.isArray(req.data.dates) ? req.data.dates.map((x) => Number(x)) : [];
    if (!uid || !year || month < 1 || month > 12 || dates.length === 0) {
        throw new https_1.HttpsError('invalid-argument', 'uid, year, month and dates are required.');
    }
    const monthStr = String(month).padStart(2, '0');
    const docId = `${uid}_${year}_${monthStr}`;
    const data = {};
    for (const dayNum of dates) {
        const date = new Date(year, month - 1, dayNum);
        if (date.getMonth() + 1 !== month)
            continue;
        const weekday = date.getDay();
        if (weekday === 0 || weekday === 6)
            continue;
        data[String(dayNum).padStart(2, '0')] = status;
    }
    await db.collection('attendance').doc(docId).set({
        uid,
        year,
        month,
        attendanceData: data,
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
        updatedBy: req.auth?.uid ?? null,
    }, { merge: true });
    return { ok: true, markedDays: Object.keys(data).length };
});
exports.upsertMember = (0, https_1.onCall)(async () => ({ ok: true }));
exports.adminAddOrRemoveAdmin = (0, https_1.onCall)(async () => ({ ok: true }));
exports.pruneAttendanceByDateRange = (0, https_1.onCall)(async () => ({ ok: true }));
exports.validateAdminSecretPhrase = (0, https_1.onCall)(async () => ({ ok: true }));
//# sourceMappingURL=index.js.map