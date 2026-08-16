const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const { authRequired, roleRequired } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => cb(null, `cert_${req.user.id}_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

router.get('/', (req, res) => {
  const { specialization, q } = req.query;
  let sql = `
    SELECT u.id, u.name, u.email, u.phone, d.specialization, d.experience, d.bio, d.verified, d.consultation_fee
    FROM users u JOIN doctor_profiles d ON u.id = d.user_id
    WHERE u.role='doctor'
  `;
  const params = [];
  if (specialization) {
    sql += ' AND d.specialization LIKE ?';
    params.push(`%${specialization}%`);
  }
  if (q) {
    sql += ' AND (u.name LIKE ? OR d.bio LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }
  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

router.get('/suggest', authRequired, roleRequired('patient'), (req, res) => {
  const { issue } = req.query;
  const map = {
    fever: 'General Physician',
    cold: 'General Physician',
    cough: 'Pulmonologist',
    heart: 'Cardiologist',
    chest: 'Cardiologist',
    skin: 'Dermatologist',
    bone: 'Orthopedic',
    fracture: 'Orthopedic',
    child: 'Pediatrician',
    kidney: 'Nephrologist',
    tooth: 'Dentist',
    eye: 'Ophthalmologist',
    mental: 'Psychiatrist',
    stomach: 'Gastroenterologist',
    pregnancy: 'Gynecologist'
  };
  let specialization = 'General Physician';
  if (issue) {
    const lower = issue.toLowerCase();
    for (const key in map) {
      if (lower.includes(key)) { specialization = map[key]; break; }
    }
  }
  const rows = db.prepare(`
    SELECT u.id, u.name, d.specialization, d.experience, d.verified, d.consultation_fee
    FROM users u JOIN doctor_profiles d ON u.id = d.user_id
    WHERE d.specialization = ? AND u.role='doctor'
  `).all(specialization);
  res.json({ suggestedSpecialization: specialization, doctors: rows });
});

router.get('/profile', authRequired, roleRequired('doctor'), (req, res) => {
  const user = db.prepare('SELECT id, name, email, phone FROM users WHERE id=?').get(req.user.id);
  const profile = db.prepare('SELECT * FROM doctor_profiles WHERE user_id=?').get(req.user.id);
  res.json({ ...user, ...profile });
});

router.put('/profile', authRequired, roleRequired('doctor'), (req, res) => {
  const { specialization, experience, bio, consultation_fee, phone } = req.body;
  db.prepare(
    'UPDATE doctor_profiles SET specialization=?, experience=?, bio=?, consultation_fee=? WHERE user_id=?'
  ).run(specialization, experience, bio, consultation_fee, req.user.id);
  if (phone !== undefined) {
    db.prepare('UPDATE users SET phone=? WHERE id=?').run(phone, req.user.id);
  }
  res.json({ success: true });
});

router.post('/certificate', authRequired, roleRequired('doctor'), upload.single('certificate'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  db.prepare('UPDATE doctor_profiles SET certificate_path=?, verified=0 WHERE user_id=?')
    .run(req.file.filename, req.user.id);
  res.json({ success: true, file: req.file.filename, message: 'Certificate uploaded, pending verification' });
});

module.exports = router;