const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const { authRequired, roleRequired } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => cb(null, `doc_${req.user.id}_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

router.post('/', authRequired, roleRequired('patient'), upload.single('file'), (req, res) => {
  const { type, title, disease } = req.body;
  const filePath = req.file ? req.file.filename : null;
  const info = db.prepare(
    'INSERT INTO documents (patient_id, type, title, disease, file_path) VALUES (?,?,?,?,?)'
  ).run(req.user.id, type, title, disease || null, filePath);
  res.json({ id: info.lastInsertRowid, success: true });
});

router.get('/mine', authRequired, roleRequired('patient'), (req, res) => {
  const rows = db.prepare('SELECT * FROM documents WHERE patient_id=? ORDER BY uploaded_at DESC').all(req.user.id);
  res.json(rows);
});

router.get('/patient/:id', authRequired, roleRequired('doctor'), (req, res) => {
  const patientId = req.params.id;
  const hasAppointment = db.prepare(
    'SELECT id FROM appointments WHERE patient_id=? AND doctor_id=? LIMIT 1'
  ).get(patientId, req.user.id);
  if (!hasAppointment) return res.status(403).json({ error: 'No appointment history with this patient' });
  const rows = db.prepare('SELECT * FROM documents WHERE patient_id=? ORDER BY uploaded_at DESC').all(patientId);
  res.json(rows);
});

router.delete('/:id', authRequired, roleRequired('patient'), (req, res) => {
  db.prepare('DELETE FROM documents WHERE id=? AND patient_id=?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

router.post('/medicines', authRequired, roleRequired('patient'), (req, res) => {
  const { document_id, name, dosage, schedule_times, start_date, end_date } = req.body;
  const info = db.prepare(
    'INSERT INTO medicines (patient_id, document_id, name, dosage, schedule_times, start_date, end_date) VALUES (?,?,?,?,?,?,?)'
  ).run(req.user.id, document_id || null, name, dosage, JSON.stringify(schedule_times || []), start_date, end_date);
  res.json({ id: info.lastInsertRowid, success: true });
});

router.get('/medicines/mine', authRequired, roleRequired('patient'), (req, res) => {
  const rows = db.prepare('SELECT * FROM medicines WHERE patient_id=?').all(req.user.id);
  const parsed = rows.map(r => ({ ...r, schedule_times: JSON.parse(r.schedule_times || '[]') }));
  res.json(parsed);
});

router.delete('/medicines/:id', authRequired, roleRequired('patient'), (req, res) => {
  db.prepare('DELETE FROM medicines WHERE id=? AND patient_id=?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

module.exports = router;