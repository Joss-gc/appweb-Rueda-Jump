const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  tel: { type: String, required: true },
  ciudad: { type: String, default: 'Pachuca' },
  tipo: { type: String, default: 'Nuevo' }, // Nuevo, Frecuente, Ocasional
  rentas: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Cliente', clienteSchema);