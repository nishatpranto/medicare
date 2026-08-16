const express = require('express');
const db = require('../db');
const { authRequired, roleRequired } = require('../middleware/auth');

const router = express.Router();

router.post('/', authRequired, roleRequired('patient'), (req, res) => {
  const { doctor_id, appointment_date, appointment_time, issue } = req.body;
  const info = db.prepare(
    'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, issue) VALUES (?,?,?,?,?)'
  ).run(req.user.id, doctor_id, appointment_date, appointment_time, issue || null);
  res.json({ id: info.lastInsertRowid, success: true });
});

router.get('/mine', authRequired, (req, res) => {
  let rows;
  if (req.user.role === 'patient') {
    rows = db.prepare(`
      SELECT a.*, u.name as doctor_name, d.specialization
      FROM appointments a
      JOIN users u ON u.id = a.doctor_id
      JOIN doctor_profiles d ON d.user_id = u.id
      WHERE a.patient_id = ?
      ORDER BY a.appointment_date DESC
    `).all(req.user.id);
  } else {
    rows = db.prepare(`
      SELECT a.*, u.name as patient_name
      FROM appointments a
      JOIN users u ON u.id = a.patient_id
      WHERE a.doctor_id = ?
      ORDER BY a.appointment_date DESC
    `).all(req.user.id);
  }
  res.json(rows);
});

router.put('/:id/status', authRequired, roleRequired('doctor'), (req, res) => {
  const { status } = req.body;
  if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  db.prepare('UPDATE appointments SET status=? WHERE id=? AND doctor_id=?')
    .run(status, req.params.id, req.user.id);
  res.json({ success: true });
});

module.exports = router;