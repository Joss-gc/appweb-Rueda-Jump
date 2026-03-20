const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Cliente = require('../models/Cliente'); 

// REGISTRO (Sin cambios, se mantiene tu lógica)
router.post('/registro', async (req, res) => {
    try {
        const { nombre, correo, telefono, password, calle, cp, colonia, referencias } = req.body;
        let clienteExistente = await Cliente.findOne({ correo });
        if (clienteExistente) return res.status(400).json({ mensaje: 'Este correo ya está registrado.' });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const nuevoCliente = new Cliente({
            nombre, correo, telefono, password: passwordHash,
            direccion: { calle, cp, colonia, referencias }
        });

        await nuevoCliente.save();
        res.status(201).json({ mensaje: '¡Cuenta creada con éxito!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al registrar el cliente.' });
    }
});

// LOGIN (Corregido para enviar ID como String)
router.post('/login', async (req, res) => {
    try {
        const { correo, password } = req.body;
        const cliente = await Cliente.findOne({ correo });
        if (!cliente) return res.status(400).json({ mensaje: 'Correo o contraseña incorrectos.' });

        const esCorrecta = await bcrypt.compare(password, cliente.password);
        if (!esCorrecta) return res.status(400).json({ mensaje: 'Correo o contraseña incorrectos.' });

        const token = jwt.sign(
            { id: cliente._id, rol: 'cliente' }, 
            process.env.JWT_SECRET || 'RUEDA_JUMP_TOKEN_SECRET_2026', 
            { expiresIn: '24h' }
        );

        res.json({
            mensaje: '¡Bienvenido!',
            token,
            cliente: {
                id: cliente._id.toString(), // 🚩 Convertimos el ID a texto real
                nombre: cliente.nombre,
                correo: cliente.correo
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al iniciar sesión.' });
    }
});

module.exports = router;