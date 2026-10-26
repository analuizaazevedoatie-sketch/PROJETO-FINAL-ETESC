/* Logica da pagina de Pesquisa */

let tipoAtual = '';
let termoAtual = '';

function cardResultadoHTML(obra) {
  return `
    <div class="card-obra" onclick="window.location.href='detalhes.html?id=${obra.id}'">
      <div class="card-obra-capa">
        <img src="${capaOuPlaceholder(obra.imagem_url, obra.tipo)}" alt="${obra.titulo}" />
      </div>
      <div class="card-obra-corpo">
        <span class="card-obra-tipo">${rotuloTipo(obra.tipo)}</span>
        <span class="card-obra-titulo">${obra.titulo}</span>
        <span class="card-obra-meta">${obra.ano || ''}${obra.autor_diretor ? ' &middot; ' + obra.autor_diretor : ''}</span>
      </div>
    </div>
  `;
}

async function executarPesquisa() {
  const container = document.getElementById('resultados');
  container.innerHTML = '<div class="carregando">Pesquisando...</div>';

  try {
    const { obras } = await Api.pesquisar(termoAtual, tipoAtual);
    if (!obras || obras.length === 0) {
      container.innerHTML = `
        <div class="estado-vazio">
          <h3>Nenhum resultado encontrado</h3>
          <p>Tente outro termo ou outro filtro de tipo.</p>
        </div>
      `;
      return;
    }
    container.innerHTML = `<div class="grid-cards">${obras.map(cardResultadoHTML).join('')}</div>`;
  } catch (erro) {
    container.innerHTML = `<div class="estado-vazio"><p>Erro ao pesquisar: ${erro.message}</p></div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const parametros = new URLSearchParams(window.location.search);
  termoAtual = parametros.get('q') || '';
  tipoAtual = parametros.get('tipo') || '';

  document.getElementById('campo-busca').value = termoAtual;

  document.querySelectorAll('.chip-filtro').forEach((chip) => {
    if (chip.dataset.tipo === tipoAtual) {
      document.querySelectorAll('.chip-filtro').forEach((c) => c.classList.remove('ativo'));
      chip.classList.add('ativo');
    }
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip-filtro').forEach((c) => c.classList.remove('ativo'));
      chip.classList.add('ativo');
      tipoAtual = chip.dataset.tipo;
      executarPesquisa();
    });
  });

  document.getElementById('form-pesquisa').addEventListener('submit', (evento) => {
    evento.preventDefault();
    termoAtual = document.getElementById('campo-busca').value.trim();
    executarPesquisa();
  });

  if (termoAtual || tipoAtual) {
    executarPesquisa();
  } else {
    executarPesquisa(); // mostra todos os resultados iniciais tambem
  }
});
