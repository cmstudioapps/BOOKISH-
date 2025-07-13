if(!localStorage.getItem("nome")) {

window.location.href = "login.html"
}

// Variáveis globais
var todosLivros = [];
var livroEmDestaque = null;
var categoriaAtiva = 'todos';
var textoBusca = '';

// Elementos da página
var destaqueEl = document.getElementById('destaque');
var livrosEl = document.getElementById('livros');
var buscaEl = document.getElementById('busca');
var filtrosEl = document.querySelectorAll('.filtro');
var perfilEl = document.getElementById('perfil');

// Carrega a foto do perfil do localStorage
function carregarFotoPerfil() {
  var foto = localStorage.getItem('imagePerfil');
  perfilEl.innerHTML = foto ? `<img src="${foto}" alt="Foto perfil">` : '<i class="fas fa-user"></i>';
}

// Busca os livros da API ou do sessionStorage
function carregarLivros() {
  // Primeiro verifica se já tem dados no sessionStorage
  const livrosSalvos = sessionStorage.getItem('livros');
  const destaqueSalvo = sessionStorage.getItem('destaque');
  
  if (livrosSalvos && destaqueSalvo) {
    todosLivros = JSON.parse(livrosSalvos);
    livroEmDestaque = JSON.parse(destaqueSalvo);
    mostrarDestaque();
    mostrarLivros();
    return; // Sai da função se já tiver os dados
  }
  
  // Só faz requisição se não tiver dados salvos
  fetch('https://bookish-ofc.vercel.app/api/postLivro')
    .then(res => res.json())
    .then(function(data) {
      // Converte para array se necessário
      todosLivros = Array.isArray(data) ? data : Object.values(data);
      
      if (todosLivros.length > 0) {
const sort = Math.floor(Math.random() * todosLivros.length) 
        livroEmDestaque = todosLivros[sort];
        
        // Salva no sessionStorage para próxima vez
        sessionStorage.setItem('livros', JSON.stringify(todosLivros));
        sessionStorage.setItem('destaque', JSON.stringify(livroEmDestaque));
        
        mostrarDestaque();
        mostrarLivros();
      } else {
        livrosEl.innerHTML = '<div class="carregando"><p>Nenhum livro encontrado</p></div>';
      }
    })
    .catch(function(error) {
      console.error('Erro ao carregar livros:', error);
      livrosEl.innerHTML = '<div class="carregando"><p>Erro ao carregar livros</p></div>';
    });
}

// Mostra o livro em destaque
function mostrarDestaque() {
  if (!livroEmDestaque) return;
  
  const { capa, titulo, autor, sinopse, genero = [], id } = livroEmDestaque;
  
  destaqueEl.innerHTML = `
    <img src="${capa}" class="destaque-capa" alt="${titulo}">
    <div class="destaque-info">
      <h1 class="destaque-titulo">${titulo}</h1>
      <p class="destaque-autor">${autor}</p>
      <p class="destaque-descricao">${sinopse}</p>
      <div class="destaque-generos">
        ${genero.slice(0, 3).map(g => `<span class="genero">${g}</span>`).join('')}
      </div>
      <a href="livro.html?id=${id}" class="botao">Ver livro</a>
    </div>
  `;
}

// Mostra a lista de livros filtrados
function mostrarLivros() {
  const livrosFiltrados = todosLivros.filter(livro => {
    // Corrigido: normaliza os gêneros para comparação
    const generosLivro = livro.genero ? livro.genero.map(g => g.toLowerCase()) : [];
    const categoriaOk = categoriaAtiva === 'todos' ||
      generosLivro.some(g => g.includes(categoriaAtiva));
    
    const buscaOk = !textoBusca ||
      (livro.titulo && livro.titulo.toLowerCase().includes(textoBusca)) ||
      (livro.autor && livro.autor.toLowerCase().includes(textoBusca));
    
    return categoriaOk && buscaOk;
  });
  
  if (livrosFiltrados.length === 0) {
    livrosEl.innerHTML = '<div class="carregando"><p>Nenhum livro encontrado</p></div>';
    return;
  }
  
  livrosEl.innerHTML = livrosFiltrados.map(livro => `
    <div class="livro" onclick="window.location='livro.html?id=${livro.id}'">
      <div class="livro-capa-container">
        <img src="${livro.capa}" class="livro-capa" alt="${livro.titulo}">
      </div>
      <div class="livro-info">
        <h3 class="livro-titulo">${livro.titulo}</h3>
        <p class="livro-autor">${livro.autor}</p>
      </div>
    </div>
  `).join('');
}

// Configura os filtros
filtrosEl.forEach(filtro => {
  filtro.addEventListener('click', function() {
    filtrosEl.forEach(f => f.classList.remove('ativo'));
    this.classList.add('ativo');
    categoriaAtiva = this.getAttribute('data-genero');
    mostrarLivros();
  });
});

// Configura a busca
buscaEl.addEventListener('input', function() {
  textoBusca = this.value.trim().toLowerCase();
  mostrarLivros();
});

// Inicia a página
window.addEventListener('DOMContentLoaded', function() {
  carregarFotoPerfil();
  carregarLivros();
});