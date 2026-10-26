const bcrypt = require('bcrypt');
const pool = require('../config/db');

const SALT_ROUNDS = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function cadastro(req, res) {
  try {
    const { nome, email, senha, confirmarSenha } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({ erro: 'Informe seu nome.' });
    }
    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ erro: 'Informe um email valido.' });
    }
    if (!senha || senha.length < 6) {
      return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
    }
    if (senha !== confirmarSenha) {
      return res.status(400).json({ erro: 'As senhas nao coincidem.' });
    }

    const existente = await pool.query('SELECT id FROM usuario WHERE email = $1', [email.toLowerCase()]);
    if (existente.rows.length > 0) {
      return res.status(409).json({ erro: 'Ja existe uma conta com este email.' });
    }

    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

    const resultado = await pool.query(
      'INSERT INTO usuario (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email',
      [nome.trim(), email.toLowerCase(), senhaHash]
    );
    const usuario = resultado.rows[0];

    // cria a lista "Biblioteca" padrao do usuario
    await pool.query('INSERT INTO lista (usuario_id, nome) VALUES ($1, $2)', [usuario.id, 'Biblioteca']);

    // autentica automaticamente apos o cadastro
    req.session.usuarioId = usuario.id;
    req.session.nome = usuario.nome;

    return res.status(201).json({ usuario });
  } catch (erro) {
    console.error('Erro no cadastro:', erro);
    return res.status(500).json({ erro: 'Erro ao criar a conta. Tente novamente.' });
  }
}

async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Informe email e senha.' });
    }

    const resultado = await pool.query(
      'SELECT id, nome, email, senha_hash FROM usuario WHERE email = $1',
      [email.toLowerCase()]
    );
    const usuario = resultado.rows[0];

    if (!usuario) {
      return res.status(401).json({ erro: 'Email ou senha invalidos.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Email ou senha invalidos.' });
    }

    req.session.usuarioId = usuario.id;
    req.session.nome = usuario.nome;

    return res.json({ usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } });
  } catch (erro) {
    console.error('Erro no login:', erro);
    return res.status(500).json({ erro: 'Erro ao entrar. Tente novamente.' });
  }
}

function logout(req, res) {
  req.session.destroy((erro) => {
    if (erro) {
      console.error('Erro no logout:', erro);
      return res.status(500).json({ erro: 'Erro ao sair.' });
    }
    res.clearCookie('connect.sid');
    return res.json({ ok: true });
  });
}

async function me(req, res) {
  if (!req.session || !req.session.usuarioId) {
    return res.json({ autenticado: false });
  }
  try {
    const resultado = await pool.query('SELECT id, nome, email FROM usuario WHERE id = $1', [req.session.usuarioId]);
    if (resultado.rows.length === 0) {
      return res.json({ autenticado: false });
    }
    return res.json({ autenticado: true, usuario: resultado.rows[0] });
  } catch (erro) {
    console.error('Erro ao buscar sessao:', erro);
    return res.status(500).json({ erro: 'Erro ao verificar sessao.' });
  }
}

module.exports = { cadastro, login, logout, me };
