const express = require('express');
const router = express.Router();
const obraController = require('../controllers/obra.controller');

router.get('/destaques', obraController.destaques);
router.get('/pesquisa', obraController.pesquisar);
router.get('/:id', obraController.detalhes);

module.exports = router;
