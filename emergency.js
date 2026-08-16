const express = require('express');
const db = require('../db');
const { authRequired, roleRequired } = require('../middleware/auth');

const router = express.Router();

router.post('/', authRequired, roleRequired('patient'), (req, res) => {
  const { name, phone, relation } = req.body;
  const info = db.prepare(
    'INSERT INTO emergency_contacts (patient_id, name, phone, relation) VALUES (?,?,?,?)'
  ).run(req.user.id, name, phone, relation || null);
  res.json({ id: info.lastInsertRowid, success: true });
});

router.get('/mine', authRequired, roleRequired('patient'), (req, res) => {
  const rows = db.prepare('SELECT * FROM emergency_contacts WHERE patient_id=?').all(req.user.id);
  res.json(rows);
});

router.delete('/:id', authRequired, roleRequired('patient'), (req, res) => {
  db.prepare('DELETE FROM emergency_contacts WHERE id=? AND patient_id=?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

module.exports = router;