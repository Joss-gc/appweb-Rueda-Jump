const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Equipo = require('../models/equipo');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img'); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// OBTENER TODOS
router.get('/', async (req, res) => {
  try {
    const equipos = await Equipo.find().sort({ createdAt: -1 }); // Los más nuevos primero
    res.json(equipos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREAR NUEVO
router.post('/', upload.single('imagen'), async (req, res) => {
  try {
    const equipo = new Equipo({
      nombre: req.body.nombre,
      categoria: req.body.categoria || 'Todos', // 🚩 Sincronizado con Angular
      precio: Number(req.body.precio),
      stock: Number(req.body.stock),
      medidas: req.body.medidas, 
      voltaje: req.body.voltaje,
      descripcion: req.body.descripcion,
      destacado: req.body.destacado === 'true', // 🚩 EL CAMPO CLAVE PARA EL HOME
      imgUrl: req.file ? `/img/${req.file.filename}` : ''
    });

    const nuevoEquipo = await equipo.save();
    res.status(201).json(nuevoEquipo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ACTUALIZAR EQUIPO
router.put('/:id', upload.single('imagen'), async (req, res) => {
  try {
    const datosActualizar = {
      nombre: req.body.nombre,
      categoria: req.body.categoria || 'Todos', // 🚩 Aseguramos que se actualice la categoría
      precio: Number(req.body.precio),
      stock: Number(req.body.stock),
      medidas: req.body.medidas, 
      voltaje: req.body.voltaje,
      descripcion: req.body.descripcion,
      destacado: req.body.destacado === 'true' // 🚩 EL CAMPO CLAVE PARA EL HOME
    };

    if (req.file) {
      datosActualizar.imgUrl = `/img/${req.file.filename}`;
    }

    const equipoActualizado = await Equipo.findByIdAndUpdate(
      req.params.id, 
      datosActualizar, 
      { new: true }
    );

    if (!equipoActualizado) return res.status(404).json({ message: "No encontrado" });
    res.json(equipoActualizado);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ELIMINAR EQUIPO
router.delete('/:id', async (req, res) => {
  try {
    await Equipo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Eliminado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;