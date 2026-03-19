const express = require('express');
const router = express.Router();
const Cliente = require('../models/cliente');

// Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    const clientes = await Cliente.find().sort({ createdAt: -1 });
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Agregar cliente
router.post('/', async (req, res) => {
  try {
    const nuevoCliente = new Cliente(req.body);
    await nuevoCliente.save();
    res.json(nuevoCliente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;