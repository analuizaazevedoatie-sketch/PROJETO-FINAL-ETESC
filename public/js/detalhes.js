/* Logica da pagina de Detalhes da obra */

function obterIdObra() {
  const parametros = new URLSearchParams(window.location.search);
  return parametros.get('id');
}

function estrelasHTML(media) {
  const cheias = Math.round(Number(media));
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += i <= cheias ? '&#9733;' : '&#9734;';
  }
  return html;
}

async function carregarDetalhes() {
  const container = document.getElementById('conteudo-detalhes');
  const obraId = obterIdObra();

  if (!obraId) {
    container.innerHTML = '<div class="estado-vazio"><p>Obra invalida.</p></div>';
    return;
  }

  try {
    const dados = await Api.detalhesObra(obraId);
    const { obra, mediaAvaliacoes, totalAvaliacoes, naBiblioteca } = dados;

    container.innerHTML = `
      <div class="detalhes-topo">
        <div class="detalhes-capa">
          <img src="${capaOuPlaceholder(obra.imagem_url, obra.tipo)}" alt="${obra.titulo}" />
        </div>
        <div>
          <span class="detalhes-tipo">${rotuloTipo(obra.tipo)}</span>
          <h1>${obra.titulo}</h1>
          <p class="detalhes-meta">
            ${obra.ano ? obra.ano : ''}
            ${obra.autor_diretor ? ' &middot; ' + obra.autor_diretor : ''}
          </p>
          <div class="detalhes-avaliacao-media">
            <span class="estrelas">${estrelasHTML(mediaAvaliacoes)}</span>
            <span>${mediaAvaliacoes} de 5 (${totalAvaliacoes} avaliacao${totalAvaliacoes === 1 ? '' : 'es'})</span>
          </div>
          <p>${obra.descricao || 'Sem descricao disponivel para esta obra.'}</p>

          <div class="detalhes-acoes">
            <button class="btn btn-primario" id="btn-avaliar">Avaliar</button>
            <button class="btn ${naBiblioteca ? 'btn-perigo' : 'btn-secundario'}" id="btn-biblioteca">
              ${naBiblioteca ? 'Remover da Biblioteca' : 'Adicionar a Biblioteca'}
            </button>
            <button class="btn btn-outline" onclick="history.back()">Voltar</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-avaliar').addEventListener('click', async () => {
      const sessao = await Api.me();
      if (!sessao.autenticado) {
        window.location.href = 'login.html';
        return;
      }
      window.location.href = `avaliar.html?id=${obraId}`;
    });

    document.getElementById('btn-biblioteca').addEventListener('click', async (evento) => {
      const sessao = await Api.me();
      if (!sessao.autenticado) {
        window.location.href = 'login.html';
        return;
      }
      const botao = evento.currentTarget;
      botao.disabled = true;
      try {
        if (naBiblioteca) {
          await Api.removerBiblioteca(obraId);
        } else {
          await Api.adicionarBiblioteca(obraId);
        }
        carregarDetalhes();
      } catch (erro) {
        alert(erro.message);
        botao.disabled = false;
      }
    });
  } catch (erro) {
    container.innerHTML = `<div class="estado-vazio"><p>${erro.message}</p></div>`;
  }
}

document.addEventListener('DOMContentLoaded', carregarDetalhes);
