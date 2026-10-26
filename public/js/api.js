/* Funcoes auxiliares para chamadas a API do SoulDiary */

async function apiFetch(caminho, opcoes = {}) {
  const config = {
    method: opcoes.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
  };
  if (opcoes.body) {
    config.body = JSON.stringify(opcoes.body);
  }

  let resposta;
  try {
    resposta = await fetch(`/api${caminho}`, config);
  } catch (erroRede) {
    throw new Error('Nao foi possivel conectar ao servidor. Verifique se o backend esta rodando.');
  }

  let dados = null;
  try {
    dados = await resposta.json();
  } catch (e) {
    dados = null;
  }

  if (!resposta.ok) {
    const mensagem = (dados && dados.erro) || 'Ocorreu um erro inesperado.';
    throw new Error(mensagem);
  }

  return dados;
}

const Api = {
  cadastro: (dados) => apiFetch('/auth/cadastro', { method: 'POST', body: dados }),
  login: (dados) => apiFetch('/auth/login', { method: 'POST', body: dados }),
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
  me: () => apiFetch('/auth/me'),

  destaques: () => apiFetch('/obras/destaques'),
  pesquisar: (q, tipo) => apiFetch(`/obras/pesquisa?q=${encodeURIComponent(q || '')}&tipo=${encodeURIComponent(tipo || '')}`),
  detalhesObra: (id) => apiFetch(`/obras/${id}`),

  biblioteca: (tipo) => apiFetch(`/biblioteca${tipo ? `?tipo=${encodeURIComponent(tipo)}` : ''}`),
  adicionarBiblioteca: (obraId) => apiFetch('/biblioteca', { method: 'POST', body: { obraId } }),
  removerBiblioteca: (obraId) => apiFetch(`/biblioteca/${obraId}`, { method: 'DELETE' }),

  minhasAvaliacoes: () => apiFetch('/avaliacoes/minhas'),
  salvarAvaliacao: (obraId, nota, comentario) =>
    apiFetch('/avaliacoes', { method: 'POST', body: { obraId, nota, comentario } }),

  perfil: () => apiFetch('/perfil'),
  atualizarPerfil: (nome, email) => apiFetch('/perfil', { method: 'PUT', body: { nome, email } }),
};

function mostrarMensagem(elemento, texto, tipo) {
  if (!elemento) return;
  elemento.textContent = texto;
  elemento.className = `mensagem visivel ${tipo}`;
}

function ocultarMensagem(elemento) {
  if (!elemento) return;
  elemento.className = 'mensagem';
  elemento.textContent = '';
}

function capaOuPlaceholder(url, tipo) {
  if (url) return url;
  const mapa = {
    filme: 'assets/placeholder-filme.svg',
    serie: 'assets/placeholder-serie.svg',
    livro: 'assets/placeholder-livro.svg',
    musica: 'assets/placeholder-musica.svg',
  };
  return mapa[tipo] || 'assets/placeholder-filme.svg';
}

function rotuloTipo(tipo) {
  const mapa = { filme: 'Filme', serie: 'Serie', livro: 'Livro', musica: 'Musica' };
  return mapa[tipo] || tipo;
}
