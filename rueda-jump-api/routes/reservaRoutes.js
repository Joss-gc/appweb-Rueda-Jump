const express = require('express');
const router = express.Router();
const Reserva = require('../models/reserva');
const Cliente = require('../models/cliente'); // 🚩 IMPORTANTE: Importar el modelo de Cliente

// 1. Obtener todas las reservas (Para Dashboard y Calendario)
// Obtener todas las reservas (Para que el Admin las vea)
router.get('/', async (req, res) => {
  try {
    // Buscamos todas las reservas y las ordenamos por la más reciente
    const reservas = await Reserva.find().sort({ fechaCreacion: -1 });
    res.json(reservas); // 🚩 Esto es lo que Angular recibe
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  console.log("--- 📥 Recibiendo petición de Angular ---");
  try {
    // 1. Guardamos la reserva primero (lo que más importa)
    const nuevaReserva = new Reserva(req.body);
    await nuevaReserva.save();
    console.log("✅ 1. Reserva guardada en MongoDB");

    // 2. Intentamos guardar el cliente (en un bloque aparte para que no rompa la reserva)
    try {
      const { nombreCliente, telefono } = req.body;
      const clienteExistente = await Cliente.findOne({ tel: telefono });
      if (!clienteExistente) {
        await new Cliente({ nombre: nombreCliente, tel: telefono }).save();
        console.log("✅ 2. Cliente nuevo registrado");
      }
    } catch (e) {
      console.log("⚠️ Nota: El cliente no se guardó, pero la reserva sí:", e.message);
    }

    // 🚩 3. LA RESPUESTA MÁGICA: Mandamos un 201 y cerramos la conexión
    console.log("🚀 Enviando señal de éxito a Angular...");
    return res.status(201).send({ ok: true, mensaje: '¡Listo!' });

  } catch (err) {
    console.error("❌ Error crítico:", err.message);
    // Si algo falla, avisamos de inmediato para que Angular no espere
    return res.status(500).send({ ok: false, error: err.message });
  }
});

// 3. Actualizar estado (Aprobar/Rechazar desde el Dashboard)
// Actualizar estado (Aprobar/Rechazar)
router.put('/:id', async (req, res) => {
  try {
    // Solo actualizamos el campo 'estado', dejamos lo demás intacto
    const reservaActualizada = await Reserva.findByIdAndUpdate(
      req.params.id, 
      { estado: req.body.estado }, // 🚩 SOLO actualizamos el estado
      { new: true }
    );
    res.json(reservaActualizada);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;