const mongoose = require('mongoose');

const EquipoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  categoria: { type: String, required: true },
  precio: { type: Number, required: true },
  stock: { type: Number, default: 1 },
  imgUrl: { type: String, default: '' },
  medidas: { type: String, default: '' },       // Ej: "5x5 metros"
  voltaje: { type: String, default: '110v' },   // Ej: "110v" o "220v"
  descripcion: { type: String, default: '' },   // Una breve reseña del inflable
  destacado: { type: Boolean, default: false }  // 🚩 NUEVO: Para saber si va al Home
}, { timestamps: true });

module.exports = mongoose.model('Equipo', EquipoSchema);