const pool = require('../config/db');

async function salvar(req, res) {
  try {
    const { obraId, nota, comentario } = req.body;
    const notaNum = Number(nota);

    if (!obraId) {
      return res.status(400).json({ erro: 'Obra invalida.' });
    }
    if (!notaNum || notaNum < 1 || notaNum > 5) {
      return res.status(400).json({ erro: 'A nota deve ser entre 1 e 5.' });
    }

    const obraExiste = await pool.query('SELECT id FROM obra WHERE id = $1', [obraId]);
    if (obraExiste.rows.length === 0) {
      return res.status(404).json({ erro: 'Obra nao encontrada.' });
    }

    const resultado = await pool.query(
      `INSERT INTO avaliacao (usuario_id, obra_id, nota, comentario)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (usuario_id, obra_id)
       DO UPDATE SET nota = EXCLUDED.nota, comentario = EXCLUDED.comentario, criado_em = NOW()
       RETURNING id, nota, comentario, criado_em`,
      [req.session.usuarioId, obraId, notaNum, comentario || null]
    );

    return res.status(201).json({ avaliacao: resultado.rows[0] });
  } catch (erro) {
    console.error('Erro ao salvar avaliacao:', erro);
    return res.status(500).json({ erro: 'Erro ao salvar sua avaliacao.' });
  }
}

async function minhas(req, res) {
  try {
    const sql = `
      SELECT a.id, a.nota, a.comentario, a.criado_em,
             o.id AS obra_id, o.titulo, o.tipo, o.imagem_url
      FROM avaliacao a
      JOIN obra o ON o.id = a.obra_id
      WHERE a.usuario_id = $1
      ORDER BY a.criado_em DESC
    `;
    const resultado = await pool.query(sql, [req.session.usuarioId]);
    return res.json({ avaliacoes: resultado.rows });
  } catch (erro) {
    console.error('Erro ao buscar avaliacoes:', erro);
    return res.status(500).json({ erro: 'Erro ao carregar suas avaliacoes.' });
  }
}

module.exports = { salvar, minhas };
