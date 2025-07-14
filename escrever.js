let image;
let Input = document.getElementById("InputImage")
Input.addEventListener("change", async function() {
    
  image = await Bs(document.getElementById("InputImage"),5)
  console.log('Imagem comprimida com sucesso!');
    
  console.log(image)
  let previewContainer = document.querySelector(".preview-container");
  let preview = document.getElementById("imagePreview")
  previewContainer.style.display = "block"
  preview.src = image
     
  })
function uploadArea() {
  
   Input = document.getElementById("InputImage").click()
  
  
}


//coleta de dados:

  function publicar() {
    const btnPublicar = document.getElementById("publishBtn")
SpinJS.start(btnPublicar, "red")
    const autor = localStorage.getItem("nome")
    const titulo = document.getElementById("titulo").value.trim()
    const sinopse = document.getElementById("sinopse").value.trim()
    const conteudo = document.getElementById("content")
    const genero = document.getElementById("genero").value
    
    const capa = image
if (!autor || !titulo || !sinopse || !conteudo.value.trim() || !genero || !capa) {
  SpinJS.stop(btnPublicar)
return alert("Erro: preencha todos os campos")
}
    
    const dados = {
      autor,
      titulo,
      sinopse,
      genero: CriarArray(genero,","),
      conteudo: conteudo.value.trim(),
      capa,
      id: CreateID("xcqwertipsbsja-", 5)
      
      
    }
   
   fetch(`https://bookish-ofc.vercel.app/api/postLivro`,{
     
     method: "POST",
     headers: {"Content-Type":"application/json"},
     body: JSON.stringify({dados})
     
     
   }).then(response => response.json())
   .then(data => {
     sessionStorage.clear();
     window.location.href = `livro.html?id=${dados.id}`
   }).finally(()=> {
    SpinJS.stop(btnPublicar)

  })
  }


//operações com "IA"

function gerarImage() {
  const botao = document.getElementById("gerarImage")
  const conteudo = document.getElementById("content").value.trim()
  const instrucao = document.getElementById("instrucao").value.trim() || "Gera uma imagem de um cavalo"
  
  SpinJS.start(botao, "red")
  fetch("https://bookish-ofc.vercel.app/api/IA", {
    
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      contexto: init(conteudo,50) || "",
      acao: "image",
      instrucao,
      nome: localStorage.getItem("nome"),
      senha: localStorage.getItem("senha")
    })
    
  }).then(response => response.json ())
  .then(data => {
    let previewContainer = document.querySelector(".preview-container");
    let preview = document.getElementById("imagePreview")
    previewContainer.style.display = "block"
    image = data.img
    preview.src = image
    
  }).catch(error => console.error(error))
  .finally(() => {
    
    SpinJS.stop(botao)
    
  })
  
}

function corrigir() {
  
let content = document.getElementById("content")
navigator.clipboard.writeText(content.value)
let btnCorrigir = document.getElementById("correctBtn")
SpinJS.start(btnCorrigir)

let instrucao = prompt("Algo a acrescentar antes de enviar para correção? (OPCIONAL)")

fetch("https://bookish-ofc.vercel.app/api/IA", {
      
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contexto: content.value.trim() || "",
        acao: "corrigir",
        instrucao,
        nome: localStorage.getItem("nome"),
      senha: localStorage.getItem("senha")
      })
}).then(response => response.json ())
.then(data => {
  if(confirm("Antes de corrigir, Certifique-se de copiar e salvar o texto original\nJA FEZ ISSO?\nSe não clique em CANCELAR!")) {
   
  content.value = data.resposta
  }
  
}).catch(error => console.error(error))
.finally(() => {
  
  SpinJS.stop(btnCorrigir, "red")
  
  
})
}