const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
    nombreCliente: { type: String, required: true },
    telefono: { type: String, required: true },
    fechaEvento: { type: String, required: true },
    hora: { type: String, required: true },
    equipo: { type: String, required: true }, // Aquí se guarda el nombre del inflable
    estado: { type: String, default: 'Pendiente' }, // 'Pendiente', 'Aprobado', 'Rechazado'
    fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reserva', reservaSchema);