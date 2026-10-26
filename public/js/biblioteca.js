/* Logica da pagina Minha Biblioteca */

let tipoAtualBiblioteca = '';

function cardBibliotecaHTML(obra) {
  return `
    <div class="card-obra">
      <div onclick="window.location.href='detalhes.html?id=${obra.id}'">
        <div class="card-obra-capa">
          <img src="${capaOuPlaceholder(obra.imagem_url, obra.tipo)}" alt="${obra.titulo}" />
        </div>
        <div class="card-obra-corpo">
          <span class="card-obra-tipo">${rotuloTipo(obra.tipo)}</span>
          <span class="card-obra-titulo">${obra.titulo}</span>
          <span class="card-obra-meta">${obra.ano || ''}${obra.autor_diretor ? ' &middot; ' + obra.autor_diretor : ''}</span>
        </div>
      </div>
      <div class="card-obra-acoes">
        <button class="btn btn-perigo btn-bloco" data-remover="${obra.id}">Remover</button>
      </div>
    </div>
  `;
}

async function carregarBiblioteca() {
  const container = document.getElementById('conteudo-biblioteca');
  container.innerHTML = '<div class="carregando">Carregando sua biblioteca...</div>';

  try {
    const { obras } = await Api.biblioteca(tipoAtualBiblioteca);

    if (!obras || obras.length === 0) {
      container.innerHTML = `
        <div class="estado-vazio">
          <h3>Sua biblioteca esta vazia</h3>
          <p>Voce ainda nao adicionou nenhuma obra a sua biblioteca.</p>
          <a href="pesquisa.html" class="btn btn-primario">Explorar obras</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `<div class="grid-cards">${obras.map(cardBibliotecaHTML).join('')}</div>`;

    container.querySelectorAll('[data-remover]').forEach((botao) => {
      botao.addEventListener('click', async () => {
        botao.disabled = true;
        try {
          await Api.removerBiblioteca(botao.dataset.remover);
          carregarBiblioteca();
        } catch (erro) {
          alert(erro.message);
          botao.disabled = false;
        }
      });
    });
  } catch (erro) {
    container.innerHTML = `<div class="estado-vazio"><p>${erro.message}</p></div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  carregarBiblioteca();

  document.querySelectorAll('.chip-filtro').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip-filtro').forEach((c) => c.classList.remove('ativo'));
      chip.classList.add('ativo');
      tipoAtualBiblioteca = chip.dataset.tipo;
      carregarBiblioteca();
    });
  });
});
