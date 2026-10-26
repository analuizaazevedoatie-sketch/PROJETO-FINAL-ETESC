const express = require('express');
const router = express.Router();
const avaliacaoController = require('../controllers/avaliacao.controller');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/minhas', avaliacaoController.minhas);
router.post('/', avaliacaoController.salvar);

module.exports = router;
