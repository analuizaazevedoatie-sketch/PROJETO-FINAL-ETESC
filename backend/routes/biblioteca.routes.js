const express = require('express');
const router = express.Router();
const biblioteca = require('../controllers/biblioteca.controller');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', biblioteca.listar);
router.post('/', biblioteca.adicionar);
router.delete('/:obraId', biblioteca.remover);

module.exports = router;
