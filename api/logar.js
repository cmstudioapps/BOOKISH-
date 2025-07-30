export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
 res.setHeader('Content-Type', 'application/json');


  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const url = "https://feed-78c44-default-rtdb.firebaseio.com/users";
  const { acao, nome, senha } = req.body || {}
  if (!acao || !nome || !senha) {
    return res.status().json({message: "falta informacoes"})
  }
  if (acao === "login") {
    fetch(`${url}/${nome}.json`)
      .then(response => response.json())
      .then(data => {
        if (data) {
          if (senha === data.senha) {
            return res.status(200).json({ message: "Sucesso no login", login: true, nome: data.nome, senha: data.senha});
          } else {
            return res.status(400).json({ message: "Senha inválida", login: false });
          }
        } else {
          return res.status(404).json({ message: "Usuário não existe" , login: "404"});
        }
      })
      .catch(error => {
        return res.status(500).json({ message: "Erro ao acessar o banco" });
      });
  }

  else if (acao === "criar") {
    const valor = 200
    const dados = { nome, senha, moedas: valor};

   //Verifica se já existe 
    fetch(`${url}/${nome}.json`)
      .then(response => response.json())
      .then(data => {
        if (data) {

          return res.status(400).json({ message: "Usuário já existe" , ok: false});

        } else {

          // Aqui usamos PATCH pra criar diretamente em /users/nome
          fetch(`${url}/${nome}.json`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
          })
            .then(() => {

              return res.status(201).json({ message: "Usuário criado com sucesso" , ok: true});

            })
            .catch(error => {

              return res.status(500).json({ message: "Erro ao salvar no banco" , ok: false});
            });
        }
      })
      .catch(error => {
        return res.status(500).json({ message: "Erro ao verificar usuário existente", ok: false });
      });
  }

  else {
    return res.status(400).json({ message: "Ação inválida" , ok: false});
  }
}
