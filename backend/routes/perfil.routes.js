const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/perfil.controller');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', perfilController.obterPerfil);
router.put('/', perfilController.atualizarPerfil);

module.exports = router;
