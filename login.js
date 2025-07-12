let acao = "";

function acessar() {
  const nome = document.getElementById("login-username").value.trim();
  const senha = document.getElementById("login-password").value.trim();
  
  if (!acao) {
    acao = "login";
  }
  
  const dados = {
    nome,
    senha,
    acao
  };
  
  fetch(`https://bookish-ofc.vercel.app/api/logar`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({dados})
    })
    .then(response => response.json())
    .then(data => {
      if (acao === "login") {
        if (data.login === "404") {
          alert("Esse usuário não existe!");
          
          if (confirm("Deseja criar uma conta nova com esses dados?")) {
            acao = "criar";
            return acessar();
          }
          
          return;
        }
        
        if (data.login === false || data.login === "false") {
          return alert("Verifique se as informações estão corretas!");
        }
        
        if (data.login === true || data.login === "true") {
          localStorage.setItem("nome", nome);
          localStorage.setItem("senha", senha);
          window.location.href = "index.html";
          return;
        }
      }
      
      if (acao === "criar") {
        if (data.ok === "false" || data.ok === false) {
          alert("Não foi possível criar: " + data.message);
          return;
        }
        
        if (data.ok === "true" || data.ok === true) {
          alert(data.message);
          acao = "login";
          return acessar();
        }
      }
    });
}