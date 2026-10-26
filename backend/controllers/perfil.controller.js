const pool = require('../config/db');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function obterPerfil(req, res) {
  try {
    const usuarioResultado = await pool.query('SELECT id, nome, email, criado_em FROM usuario WHERE id = $1', [
      req.session.usuarioId,
    ]);
    const usuario = usuarioResultado.rows[0];
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuario nao encontrado.' });
    }

    const bibliotecaResultado = await pool.query(
      `SELECT COUNT(*) AS total FROM lista_obra lo
       JOIN lista l ON l.id = lo.lista_id
       WHERE l.usuario_id = $1`,
      [req.session.usuarioId]
    );
    const avaliacoesResultado = await pool.query('SELECT COUNT(*) AS total FROM avaliacao WHERE usuario_id = $1', [
      req.session.usuarioId,
    ]);

    return res.json({
      usuario,
      totalBiblioteca: Number(bibliotecaResultado.rows[0].total),
      totalAvaliacoes: Number(avaliacoesResultado.rows[0].total),
    });
  } catch (erro) {
    console.error('Erro ao buscar perfil:', erro);
    return res.status(500).json({ erro: 'Erro ao carregar o perfil.' });
  }
}

async function atualizarPerfil(req, res) {
  try {
    const { nome, email } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({ erro: 'Informe seu nome.' });
    }
    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ erro: 'Informe um email valido.' });
    }

    const emailEmUso = await pool.query('SELECT id FROM usuario WHERE email = $1 AND id <> $2', [
      email.toLowerCase(),
      req.session.usuarioId,
    ]);
    if (emailEmUso.rows.length > 0) {
      return res.status(409).json({ erro: 'Este email ja esta em uso por outra conta.' });
    }

    const resultado = await pool.query(
      'UPDATE usuario SET nome = $1, email = $2 WHERE id = $3 RETURNING id, nome, email',
      [nome.trim(), email.toLowerCase(), req.session.usuarioId]
    );

    req.session.nome = resultado.rows[0].nome;
    return res.json({ usuario: resultado.rows[0] });
  } catch (erro) {
    console.error('Erro ao atualizar perfil:', erro);
    return res.status(500).json({ erro: 'Erro ao atualizar o perfil.' });
  }
}

module.exports = { obterPerfil, atualizarPerfil };
