/* Logica da pagina de Perfil (visualizacao + edicao) */

let perfilAtual = null;

function inicialNome(nome) {
  return (nome || '?').trim().charAt(0).toUpperCase();
}

function renderizarVisualizacao() {
  const container = document.getElementById('conteudo-perfil');
  const { usuario, totalBiblioteca, totalAvaliacoes } = perfilAtual;

  container.innerHTML = `
    <div class="perfil-card">
      <div class="perfil-cabecalho">
        <div class="perfil-avatar">${inicialNome(usuario.nome)}</div>
        <div>
          <h2 style="margin-bottom: 2px;">${usuario.nome}</h2>
          <p style="margin: 0; color: #6b5850;">${usuario.email}</p>
        </div>
      </div>
      <div class="perfil-stats">
        <div>
          <div class="perfil-stat-numero">${totalBiblioteca}</div>
          <div class="perfil-stat-label">Na biblioteca</div>
        </div>
        <div>
          <div class="perfil-stat-numero">${totalAvaliacoes}</div>
          <div class="perfil-stat-label">Avaliacoes feitas</div>
        </div>
      </div>
    </div>

    <div class="perfil-links">
      <a href="biblioteca.html" class="btn btn-secundario">Minha Biblioteca</a>
      <a href="avaliacoes.html" class="btn btn-secundario">Minhas Avaliacoes</a>
      <button class="btn btn-outline" id="btn-editar-perfil">Editar Perfil</button>
      <button class="btn btn-perigo" id="btn-logout-perfil">Logout</button>
    </div>
  `;

  document.getElementById('btn-editar-perfil').addEventListener('click', renderizarEdicao);
  document.getElementById('btn-logout-perfil').addEventListener('click', async () => {
    try {
      await Api.logout();
    } catch (e) {
      /* segue mesmo se der erro */
    }
    window.location.href = 'login.html';
  });
}

function renderizarEdicao() {
  const container = document.getElementById('conteudo-perfil');
  const { usuario } = perfilAtual;

  container.innerHTML = `
    <div class="perfil-card">
      <h2>Editar Perfil</h2>
      <div class="mensagem" id="mensagem-perfil"></div>
      <form id="form-editar-perfil">
        <div class="campo">
          <label for="nome-edicao">Nome</label>
          <input type="text" id="nome-edicao" value="${usuario.nome}" required />
        </div>
        <div class="campo">
          <label for="email-edicao">Email</label>
          <input type="email" id="email-edicao" value="${usuario.email}" required />
        </div>
        <div style="display: flex; gap: 10px;">
          <button type="submit" class="btn btn-primario">Salvar alteracoes</button>
          <button type="button" class="btn btn-outline" id="btn-cancelar-edicao">Cancelar</button>
        </div>
      </form>
    </div>
  `;

  document.getElementById('btn-cancelar-edicao').addEventListener('click', renderizarVisualizacao);

  document.getElementById('form-editar-perfil').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const mensagem = document.getElementById('mensagem-perfil');
    ocultarMensagem(mensagem);

    const nome = document.getElementById('nome-edicao').value.trim();
    const email = document.getElementById('email-edicao').value.trim();

    try {
      await Api.atualizarPerfil(nome, email);
      await carregarPerfil();
      mostrarMensagem(mensagem, 'Perfil atualizado com sucesso!', 'sucesso');
    } catch (erro) {
      mostrarMensagem(mensagem, erro.message, 'erro');
    }
  });
}

async function carregarPerfil() {
  const container = document.getElementById('conteudo-perfil');
  try {
    perfilAtual = await Api.perfil();
    renderizarVisualizacao();
  } catch (erro) {
    container.innerHTML = `<div class="estado-vazio"><p>${erro.message}</p></div>`;
  }
}

document.addEventListener('DOMContentLoaded', carregarPerfil);
