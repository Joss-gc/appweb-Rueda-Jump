const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Reserva = require('../models/reserva');
const Equipo = require('../models/equipo'); // Importamos el modelo de Equipo

// Configuración de Multer para los comprobantes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/comprobantes'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'pago-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Obtener todas las reservas
router.get('/', async (req, res) => {
  try {
    const reservas = await Reserva.find().sort({ createdAt: -1 });
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener reservas', error });
  }
});

// =================================================================
// 🚩 MAGIA 1: RESTAR STOCK EN CUANTO EL CLIENTE PIDE EL EQUIPO
// =================================================================
router.post('/', async (req, res) => {
  try {
    const nuevaReserva = new Reserva(req.body);
    await nuevaReserva.save();

    // Le restamos 1 al stock automáticamente para "apartarlo" y que nadie más lo pida
    await Equipo.findOneAndUpdate(
      { nombre: nuevaReserva.equipo },
      { $inc: { stock: -1 } } // Resta 1
    );

    res.status(201).json(nuevaReserva);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear reserva', error });
  }
});

// =================================================================
// 🚩 MAGIA 2: DEVOLVER EL STOCK SI TÚ RECHAZAS LA RENTA
// =================================================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const nuevosDatos = req.body;

    const reservaAnterior = await Reserva.findById(id);
    if (!reservaAnterior) return res.status(404).json({ message: 'Reserva no encontrada' });

    const reservaActualizada = await Reserva.findByIdAndUpdate(id, nuevosDatos, { new: true });

    // Si tú como Admin decides "Rechazar" la renta, el sistema regresa el inflable a la vitrina sumándole 1
    if (nuevosDatos.estado === 'Rechazado' && reservaAnterior.estado !== 'Rechazado') {
      await Equipo.findOneAndUpdate(
        { nombre: reservaActualizada.equipo }, 
        { $inc: { stock: 1 } } // Suma 1 de regreso
      );
    }

    res.json(reservaActualizada);
  } catch (error) {
    console.error("Error al actualizar estado y stock:", error);
    res.status(500).json({ message: 'Error al actualizar reserva', error });
  }
});

// Ruta exclusiva para subir el comprobante de pago
router.put('/:id/pago', upload.single('comprobante'), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No se subió ningún archivo' });
    }

    const comprobanteUrl = '/comprobantes/' + req.file.filename;

    const reservaActualizada = await Reserva.findByIdAndUpdate(
      id, 
      { 
        comprobanteUrl: comprobanteUrl,
        estadoPago: 'En Revisión' 
      }, 
      { new: true }
    );

    res.json(reservaActualizada);
  } catch (error) {
    console.error("Error al subir comprobante:", error);
    res.status(500).json({ message: 'Error al subir comprobante', error });
  }
});

// Ruta para que el admin confirme que ya revisó y aceptó el pago
router.put('/:id/confirmar-pago', async (req, res) => {
  try {
    const { id } = req.params;
    const reservaActualizada = await Reserva.findByIdAndUpdate(
      id, 
      { estadoPago: 'Pagado' }, 
      { new: true }
    );
    res.json(reservaActualizada);
  } catch (error) {
    res.status(500).json({ message: 'Error al confirmar pago', error });
  }
});

module.exports = router;