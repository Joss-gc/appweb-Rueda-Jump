const express = require('express');
const router = express.Router();
const Reserva = require('../models/reserva'); // Verifica que este nombre coincida con tu modelo real
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 🚩 CONFIGURACIÓN MULTER PARA COMPROBANTES
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const pathDir = path.join(__dirname, '../public/comprobantes');
    if (!fs.existsSync(pathDir)) {
      fs.mkdirSync(pathDir, { recursive: true });
    }
    cb(null, pathDir);
  },
  filename: (req, file, cb) => {
    // Generamos un nombre único para que no se sobreescriban fotos
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'pago_' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Obtener todas las reservas
router.get('/', async (req, res) => {
  try {
    const reservas = await Reserva.find().sort({ fechaCreacion: -1 });
    res.json(reservas);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// Obtener por teléfono del cliente
router.get('/cliente/:telefono', async (req, res) => {
  try {
    const { telefono } = req.params;
    const reservas = await Reserva.find({ telefono: telefono }).sort({ fechaCreacion: -1 });
    res.json(reservas);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// Crear nueva reserva
router.post('/', async (req, res) => {
  try {
    const nuevaReserva = new Reserva(req.body);
    await nuevaReserva.save();
    return res.status(201).send({ ok: true, mensaje: '¡Listo!', reserva: nuevaReserva });
  } catch (err) {
    return res.status(500).send({ ok: false, error: err.message });
  }
});

// 🚩 ACTUALIZAR CUALQUIER DATO (Esto usa el Admin para poner "Pagado" o "Confirmado")
router.put('/:id', async (req, res) => {
  try {
    const reservaActualizada = await Reserva.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, // 🚩 ESTO ES VITAL
      { new: true }
    );
    res.json(reservaActualizada);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 🚩 LA RUTA QUE FALTABA: SUBIR COMPROBANTE DE PAGO
// Nota que aquí sí usamos 'upload.single("comprobante")' y la ruta es '/:id/pago'
router.put('/:id/pago', upload.single('comprobante'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ningún archivo." });
    }

    // Guardamos la URL de la foto y pasamos a En Revisión automáticamente
    const reservaActualizada = await Reserva.findByIdAndUpdate(
      req.params.id, 
      { 
        $set: { 
          comprobanteUrl: `/comprobantes/${req.file.filename}`,
          estadoPago: 'En Revisión' 
        } 
      }, 
      { new: true }
    );
    res.json(reservaActualizada);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;