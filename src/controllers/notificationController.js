const notifModel = require('../models/notificationModel');
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/notifications
const getAll = async (req, res) => {
  try {
    const notifications = await notifModel.getByUser(req.user.id);
    const unreadCount   = notifications.filter(n => !n.is_read).length;
    return successResponse(res, 'OK', { notifications, unreadCount });
  } catch (err) {
    console.error('getAll notif error:', err);
    return errorResponse(res, 'Terjadi kesalahan server.', 500);
  }
};

// PATCH /api/notifications/:id/read
const markRead = async (req, res) => {
  try {
    const updated = await notifModel.markRead(req.params.id, req.user.id);
    if (!updated) return errorResponse(res, 'Notifikasi tidak ditemukan.', 404);
    return successResponse(res, 'Notifikasi ditandai sudah dibaca.');
  } catch (err) {
    console.error('markRead error:', err);
    return errorResponse(res, 'Terjadi kesalahan server.', 500);
  }
};

// PATCH /api/notifications/read-all
const markAllRead = async (req, res) => {
  try {
    await notifModel.markAllRead(req.user.id);
    return successResponse(res, 'Semua notifikasi ditandai sudah dibaca.');
  } catch (err) {
    console.error('markAllRead error:', err);
    return errorResponse(res, 'Terjadi kesalahan server.', 500);
  }
};

// DELETE /api/notifications/:id
const remove = async (req, res) => {
  try {
    const deleted = await notifModel.remove(req.params.id, req.user.id);
    if (!deleted) return errorResponse(res, 'Notifikasi tidak ditemukan.', 404);
    return successResponse(res, 'Notifikasi berhasil dihapus.');
  } catch (err) {
    console.error('remove notif error:', err);
    return errorResponse(res, 'Terjadi kesalahan server.', 500);
  }
};

module.exports = { getAll, markRead, markAllRead, remove };