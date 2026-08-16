const express = require('express');
const db = require('../db');
const { authRequired, roleRequired } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', authRequired, roleRequired('patient'), (req, res) => {
  const user = db.prepare('SELECT id, name, email, phone FROM users WHERE id = ?').get(req.user.id);
  const profile = db.prepare('SELECT * FROM patient_profiles WHERE user_id = ?').get(req.user.id);
  res.json({ ...user, ...profile });
});

router.put('/profile', authRequired, roleRequired('patient'), (req, res) => {
  const { dob, blood_group, address, known_diseases, phone } = req.body;
  db.prepare(
    'UPDATE patient_profiles SET dob=?, blood_group=?, address=?, known_diseases=? WHERE user_id=?'
  ).run(dob, blood_group, address, known_diseases, req.user.id);
  if (phone !== undefined) {
    db.prepare('UPDATE users SET phone=? WHERE id=?').run(phone, req.user.id);
  }
  res.json({ success: true });
});

router.get('/:id/profile', authRequired, roleRequired('doctor'), (req, res) => {
  const patientId = req.params.id;
  const hasAppointment = db.prepare(
    `SELECT id FROM appointments WHERE patient_id=? AND doctor_id=? LIMIT 1`
  ).get(patientId, req.user.id);
  if (!hasAppointment) return res.status(403).json({ error: 'No appointment history with this patient' });

  const user = db.prepare('SELECT id, name, email, phone FROM users WHERE id = ?').get(patientId);
  const profile = db.prepare('SELECT * FROM patient_profiles WHERE user_id = ?').get(patientId);
  res.json({ ...user, ...profile });
});

module.exports = router;