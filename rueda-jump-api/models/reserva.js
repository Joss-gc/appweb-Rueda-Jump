const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
    nombreCliente: { type: String, required: true, trim: true },
    telefono: { type: String, required: true, trim: true },
    fechaEvento: { type: String, required: true },
    hora: { type: String, required: true },
    equipo: { type: String, required: true, trim: true },
    precio: { type: Number, default: 0 }, // 🚩 NUEVO: Por si quieres guardar el costo real
    estado: { type: String, default: 'Pendiente' },
    
    // 🚩 CAMPOS PARA PAGOS
    comprobanteUrl: { type: String }, // Aquí guardaremos la ruta de la foto/pdf
    estadoPago: { type: String, default: 'Pendiente' }, // 'Pendiente', 'En Revisión', 'Pagado'
    
    fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reserva', reservaSchema);