const express = require('express');
const router = express.Router();
const Cliente = require('../models/Cliente');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const pathDir = path.join(__dirname, '../public/perfiles');
    if (!fs.existsSync(pathDir)) {
      fs.mkdirSync(pathDir, { recursive: true });
    }
    cb(null, pathDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.get('/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id).lean();
    if (!cliente) return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    delete cliente.password;
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error de servidor' });
  }
});

router.put('/:id', upload.single('foto'), async (req, res) => {
  try {
    const { id } = req.params;
    let datosActualizar = {
      nombre: req.body.nombre,
      telefono: req.body.telefono
    };

    if (req.file) {
      // Guardamos SIEMPRE la ruta relativa limpia
      datosActualizar.fotoUrl = `/perfiles/${req.file.filename}`;
    }

    if (req.body.direccion) {
      try {
        datosActualizar.direccion = typeof req.body.direccion === 'string' 
          ? JSON.parse(req.body.direccion) 
          : req.body.direccion;
      } catch (e) {
        console.error("Error parseando dirección");
      }
    }

    const clienteActualizado = await Cliente.findByIdAndUpdate(
      id, 
      { $set: datosActualizar }, 
      { returnDocument: 'after', runValidators: true }
    );
    res.json(clienteActualizado);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar' });
  }
});

router.get('/', async (req, res) => {
  try {
    const clientes = await Cliente.find().sort({ createdAt: -1 });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error' });
  }
});

module.exports = router;