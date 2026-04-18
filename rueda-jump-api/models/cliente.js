const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  telefono: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  direccion: {
    calle: { type: String },
    cp: { type: String },
    colonia: { type: String },
    referencias: { type: String }
  },
  ciudad: { type: String, default: 'Pachuca' },
  tipo: { type: String, default: 'Nuevo' },
  rentas: { type: Number, default: 0 },
  
  // 🚩 ¡LA PIEZA FALTANTE! EL INVITADO VIP:
  fotoUrl: { type: String }, 

}, { timestamps: true });

module.exports = mongoose.model('Cliente', clienteSchema);