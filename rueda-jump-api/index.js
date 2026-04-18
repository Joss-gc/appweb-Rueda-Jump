const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // 🚩 NUEVO: Herramienta para leer/crear carpetas
require('dotenv').config();

const equipoRoutes = require('./routes/equipoRoutes');
const clienteRoutes = require('./routes/clienteRoutes'); 
const reservaRoutes = require('./routes/reservaRoutes'); 
const authRoutes = require('./routes/authRoutes'); 

const app = express();

// 🚩 BLINDAJE: Crear carpetas automáticamente si no existen
// Esto evita el 99% de los errores al subir archivos o comprobantes
const carpetasRequeridas = ['public/img', 'public/perfiles', 'public/comprobantes'];
carpetasRequeridas.forEach(carpeta => {
  const rutaCompleta = path.join(__dirname, carpeta);
  if (!fs.existsSync(rutaCompleta)) {
    fs.mkdirSync(rutaCompleta, { recursive: true });
    console.log(`📁 Carpeta creada automáticamente: ${carpeta}`);
  }
});

// Configuración de CORS para Angular
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'public/img')));
app.use('/perfiles', express.static(path.join(__dirname, 'public/perfiles')));
app.use('/comprobantes', express.static(path.join(__dirname, 'public/comprobantes')));

// Rutas de la API
app.use('/api/equipos', equipoRoutes);
app.use('/api/clientes', clienteRoutes); 
app.use('/api/reservas', reservaRoutes); 
app.use('/api/auth', authRoutes); 

// Conexión a MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rueda_jump'; 

mongoose.connect(mongoURI)
  .then(() => console.log('✅ ¡Conectado a MongoDB (127.0.0.1)!'))
  .catch(err => {
    console.error('❌ Error crítico en MongoDB:', err.message);
  });

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor Rueda Jump corriendo en http://127.0.0.1:${PORT}`);
});