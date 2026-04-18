const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
    // Datos del Cliente
    nombreCliente: { type: String, required: true, trim: true },
    telefono: { type: String, required: true, trim: true },
    
    // 🚩 Dirección desglosada y blindada para la logística
    direccion: { type: String, trim: true, default: 'Sin dirección' }, 
    colonia: { type: String, trim: true, default: '' }, 
    cp: { type: String, trim: true, default: '' },      

    // Detalles del Evento
    fechaEvento: { type: String, required: true },
    hora: { type: String, required: true },
    
    // Detalles del Equipo y Dinero
    equipo: { type: String, required: true, trim: true },
    precio: { type: Number, default: 0 }, 
    
    // Estados de Control (Logística y Pagos)
    estado: { type: String, default: 'Pendiente' }, // Pendiente, Aprobado, Rechazado
    estadoPago: { type: String, default: 'Pendiente' }, // Pendiente, En Revisión, Pagado
    comprobanteUrl: { type: String, default: '' }, 
    
    // Fecha de registro automático
    fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reserva', reservaSchema);