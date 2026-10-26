const pool = require('../config/db');

const TIPOS_VALIDOS = ['filme', 'serie', 'livro', 'musica'];

async function pesquisar(req, res) {
  try {
    const { q = '', tipo = '' } = req.query;
    const condicoes = [];
    const valores = [];

    if (q && q.trim()) {
      valores.push(`%${q.trim().toLowerCase()}%`);
      condicoes.push(`(LOWER(titulo) LIKE $${valores.length} OR LOWER(autor_diretor) LIKE $${valores.length})`);
    }
    if (tipo && TIPOS_VALIDOS.includes(tipo)) {
      valores.push(tipo);
      condicoes.push(`tipo = $${valores.length}`);
    }

    const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';
    const sql = `SELECT id, titulo, tipo, ano, autor_diretor, imagem_url FROM obra ${where} ORDER BY titulo ASC LIMIT 60`;

    const resultado = await pool.query(sql, valores);
    return res.json({ obras: resultado.rows });
  } catch (erro) {
    console.error('Erro na pesquisa:', erro);
    return res.status(500).json({ erro: 'Erro ao pesquisar obras.' });
  }
}

async function destaques(req, res) {
  try {
    const consultas = TIPOS_VALIDOS.map((tipo) =>
      pool.query(
        'SELECT id, titulo, tipo, ano, autor_diretor, imagem_url FROM obra WHERE tipo = $1 ORDER BY criado_em DESC LIMIT 6',
        [tipo]
      )
    );
    const resultados = await Promise.all(consultas);
    const secoes = {};
    TIPOS_VALIDOS.forEach((tipo, i) => {
      secoes[tipo] = resultados[i].rows;
    });
    return res.json({ secoes });
  } catch (erro) {
    console.error('Erro ao buscar destaques:', erro);
    return res.status(500).json({ erro: 'Erro ao carregar a home.' });
  }
}

async function detalhes(req, res) {
  try {
    const { id } = req.params;
    const obraResultado = await pool.query('SELECT * FROM obra WHERE id = $1', [id]);
    const obra = obraResultado.rows[0];

    if (!obra) {
      return res.status(404).json({ erro: 'Obra nao encontrada.' });
    }

    const statsResultado = await pool.query(
      'SELECT COALESCE(AVG(nota), 0) AS media, COUNT(*) AS total FROM avaliacao WHERE obra_id = $1',
      [id]
    );
    const stats = statsResultado.rows[0];

    let naBiblioteca = false;
    let minhaAvaliacao = null;

    if (req.session && req.session.usuarioId) {
      const bibliotecaResultado = await pool.query(
        `SELECT 1 FROM lista_obra lo
         JOIN lista l ON l.id = lo.lista_id
         WHERE l.usuario_id = $1 AND lo.obra_id = $2`,
        [req.session.usuarioId, id]
      );
      naBiblioteca = bibliotecaResultado.rows.length > 0;

      const avaliacaoResultado = await pool.query(
        'SELECT nota, comentario FROM avaliacao WHERE usuario_id = $1 AND obra_id = $2',
        [req.session.usuarioId, id]
      );
      minhaAvaliacao = avaliacaoResultado.rows[0] || null;
    }

    return res.json({
      obra,
      mediaAvaliacoes: Number(stats.media).toFixed(1),
      totalAvaliacoes: Number(stats.total),
      naBiblioteca,
      minhaAvaliacao,
    });
  } catch (erro) {
    console.error('Erro ao buscar detalhes:', erro);
    return res.status(500).json({ erro: 'Erro ao carregar detalhes da obra.' });
  }
}

module.exports = { pesquisar, destaques, detalhes };
