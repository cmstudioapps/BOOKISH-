if (!localStorage.getItem("nome")) {
  window.location.href = "login.html";
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
var MostrarSaldo = document.getElementById("Moedas");

// Carrega a foto do perfil do localStorage (com validação)
function carregarFotoPerfil() {
  var foto = localStorage.getItem('imagePerfil');
  if (foto && /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(foto)) {
    const img = document.createElement("img");
    img.src = foto;
    img.alt = "Foto perfil";
    perfilEl.innerHTML = "";
    perfilEl.appendChild(img);
  } else {
    perfilEl.innerHTML = '<i class="fas fa-user"></i>';
  }
}

// Busca o saldo do usuário (sem innerHTML)
fetch(`https://bookish-ofc.vercel.app/api/moedas?nome=${localStorage.getItem("nome")}`)
  .then(response => response.text())
  .then(moedas => {
    MostrarSaldo.innerHTML += moedas || "0";
    MostrarSaldo.style.color = "yellow";
    MostrarSaldo.style.textDecoration = "none";
  });

// Busca os livros da API ou do sessionStorage
function carregarLivros() {
  const livrosSalvos = sessionStorage.getItem('livros');
  const destaqueSalvo = sessionStorage.getItem('destaque');

  if (livrosSalvos && destaqueSalvo) {
    todosLivros = JSON.parse(livrosSalvos);
    livroEmDestaque = JSON.parse(destaqueSalvo);
    mostrarDestaque();
    mostrarLivros();
    return;
  }

  fetch('https://bookish-ofc.vercel.app/api/postLivro')
    .then(res => res.json())
    .then(function (data) {
      todosLivros = Array.isArray(data) ? data : Object.values(data).filter(livro => typeof livro === 'object' && livro.titulo);

      if (todosLivros.length > 0) {
        const sort = Math.floor(Math.random() * todosLivros.length);
        livroEmDestaque = todosLivros[sort];

        sessionStorage.setItem('livros', JSON.stringify(todosLivros));
        sessionStorage.setItem('destaque', JSON.stringify(livroEmDestaque));

        mostrarDestaque();
        mostrarLivros();
      } else {
        livrosEl.textContent = "Nenhum livro encontrado";
      }
    })
    .catch(function (error) {
      console.error('Erro ao carregar livros:', error);
      livrosEl.textContent = "Erro ao carregar livros";
    });
}

// Mostra o livro em destaque (sem innerHTML perigoso)
function mostrarDestaque() {
  if (!livroEmDestaque) return;

  const { capa, titulo, autor, sinopse, genero = [], id } = livroEmDestaque;

  destaqueEl.innerHTML = ""; // limpa
  const img = document.createElement("img");
  img.src = capa;
  img.className = "destaque-capa";
  img.alt = titulo;

  const infoDiv = document.createElement("div");
  infoDiv.className = "destaque-info";

  const h1 = document.createElement("h1");
  h1.className = "destaque-titulo";
  h1.textContent = titulo;

  const pAutor = document.createElement("p");
  pAutor.className = "destaque-autor";
  pAutor.textContent = autor;

  const pDesc = document.createElement("p");
  pDesc.className = "destaque-descricao";
  pDesc.textContent = sinopse;

  const genContainer = document.createElement("div");
  genContainer.className = "destaque-generos";
  genero.slice(0, 3).forEach(g => {
    const span = document.createElement("span");
    span.className = "genero";
    span.textContent = g;
    genContainer.appendChild(span);
  });

  const link = document.createElement("a");
  link.href = `livro.html?id=${id}`;
  link.className = "botao";
  link.textContent = "Ver livro";

  infoDiv.append(h1, pAutor, pDesc, genContainer, link);
  destaqueEl.append(img, infoDiv);
}

// Mostra a lista de livros (sem innerHTML malicioso)
function mostrarLivros() {
  const livrosFiltrados = todosLivros.filter(livro => {
    const generosLivro = livro.genero ? livro.genero.map(g => g.toLowerCase()) : [];
    const categoriaOk = categoriaAtiva === 'todos' || generosLivro.some(g => g.includes(categoriaAtiva));
    const buscaOk = !textoBusca ||
      (livro.titulo && livro.titulo.toLowerCase().includes(textoBusca)) ||
      (livro.autor && livro.autor.toLowerCase().includes(textoBusca));

    return categoriaOk && buscaOk;
  });

  livrosEl.innerHTML = ""; // limpa

  if (livrosFiltrados.length === 0) {
    livrosEl.textContent = "Nenhum livro encontrado";
    return;
  }

  livrosFiltrados.forEach(livro => {
    const livroDiv = document.createElement("div");
    livroDiv.className = "livro";
    livroDiv.onclick = () => window.location = `livro.html?id=${livro.id}`;

    const capaContainer = document.createElement("div");
    capaContainer.className = "livro-capa-container";

    const img = document.createElement("img");
    img.src = livro.capa;
    img.className = "livro-capa";
    img.alt = livro.titulo;

    const info = document.createElement("div");
    info.className = "livro-info";

    const h3 = document.createElement("h3");
    h3.className = "livro-titulo";
    h3.textContent = livro.titulo;

    const p = document.createElement("p");
    p.className = "livro-autor";
    p.textContent = livro.autor;

    capaContainer.appendChild(img);
    info.append(h3, p);
    livroDiv.append(capaContainer, info);
    livrosEl.appendChild(livroDiv);
  });
}

// Filtros
filtrosEl.forEach(filtro => {
  filtro.addEventListener('click', function () {
    filtrosEl.forEach(f => f.classList.remove('ativo'));
    this.classList.add('ativo');
    categoriaAtiva = this.getAttribute('data-genero');
    mostrarLivros();
  });
});

// Busca
buscaEl.addEventListener('input', function () {
  textoBusca = this.value.trim().toLowerCase();
  mostrarLivros();
});

// Início
window.addEventListener('DOMContentLoaded', function () {
  carregarFotoPerfil();
  carregarLivros();
});