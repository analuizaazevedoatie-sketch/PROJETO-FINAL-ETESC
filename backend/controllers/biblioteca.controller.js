const pool = require('../config/db');

const TIPOS_VALIDOS = ['filme', 'serie', 'livro', 'musica'];

async function obterListaId(usuarioId) {
  const resultado = await pool.query('SELECT id FROM lista WHERE usuario_id = $1 ORDER BY id ASC LIMIT 1', [usuarioId]);
  if (resultado.rows.length > 0) {
    return resultado.rows[0].id;
  }
  const nova = await pool.query('INSERT INTO lista (usuario_id, nome) VALUES ($1, $2) RETURNING id', [usuarioId, 'Biblioteca']);
  return nova.rows[0].id;
}

async function listar(req, res) {
  try {
    const { tipo = '' } = req.query;
    const listaId = await obterListaId(req.session.usuarioId);

    const condicoes = ['lo.lista_id = $1'];
    const valores = [listaId];

    if (tipo && TIPOS_VALIDOS.includes(tipo)) {
      valores.push(tipo);
      condicoes.push(`o.tipo = $${valores.length}`);
    }

    const sql = `
      SELECT o.id, o.titulo, o.tipo, o.ano, o.autor_diretor, o.imagem_url, lo.adicionado_em
      FROM lista_obra lo
      JOIN obra o ON o.id = lo.obra_id
      WHERE ${condicoes.join(' AND ')}
      ORDER BY lo.adicionado_em DESC
    `;
    const resultado = await pool.query(sql, valores);
    return res.json({ obras: resultado.rows });
  } catch (erro) {
    console.error('Erro ao listar biblioteca:', erro);
    return res.status(500).json({ erro: 'Erro ao carregar sua biblioteca.' });
  }
}

async function adicionar(req, res) {
  try {
    const { obraId } = req.body;
    if (!obraId) {
      return res.status(400).json({ erro: 'Obra invalida.' });
    }

    const obraExiste = await pool.query('SELECT id FROM obra WHERE id = $1', [obraId]);
    if (obraExiste.rows.length === 0) {
      return res.status(404).json({ erro: 'Obra nao encontrada.' });
    }

    const listaId = await obterListaId(req.session.usuarioId);
    await pool.query(
      'INSERT INTO lista_obra (lista_id, obra_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [listaId, obraId]
    );
    return res.status(201).json({ ok: true });
  } catch (erro) {
    console.error('Erro ao adicionar a biblioteca:', erro);
    return res.status(500).json({ erro: 'Erro ao adicionar a obra a biblioteca.' });
  }
}

async function remover(req, res) {
  try {
    const { obraId } = req.params;
    const listaId = await obterListaId(req.session.usuarioId);
    await pool.query('DELETE FROM lista_obra WHERE lista_id = $1 AND obra_id = $2', [listaId, obraId]);
    return res.json({ ok: true });
  } catch (erro) {
    console.error('Erro ao remover da biblioteca:', erro);
    return res.status(500).json({ erro: 'Erro ao remover a obra da biblioteca.' });
  }
}

module.exports = { listar, adicionar, remover, obterListaId };
