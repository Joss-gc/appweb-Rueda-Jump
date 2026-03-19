const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const equipoRoutes = require('./routes/equipoRoutes');
const clienteRoutes = require('./routes/clienteRoutes'); 
const reservaRoutes = require('./routes/reservaRoutes'); 

const app = express();

// --- MIDDLEWARES ---
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'public/img')));

// --- RUTAS ---
app.use('/api/equipos', equipoRoutes);
app.use('/api/clientes', clienteRoutes); 
app.use('/api/reservas', reservaRoutes); 

// --- CONEXIÓN A MONGODB (Usando IP directa para velocidad) ---
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rueda_jump'; 

mongoose.connect(mongoURI)
  .then(() => console.log('✅ ¡Conectado a MongoDB (127.0.0.1)!'))
  .catch(err => console.error('❌ Error en MongoDB:', err));

app.get('/', (req, res) => {
  res.send('Servidor de Rueda Jump funcionando 🎪');
});

app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => { // Escucha en todas las interfaces
  console.log(`🚀 Servidor corriendo en http://127.0.0.1:${PORT}`);
});