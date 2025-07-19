export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const { pacote, nome, senha, codigo } = req.body;

  if (!pacote || !nome || !senha || !codigo) {
    return res.status(400).json({ok: false, message: "falta dados"});
  }
  
  const usuarios = "https://feed-78c44-default-rtdb.firebaseio.com/users";
  let saldoMoedas = 0;
  
  fetch(`${usuarios}/${nome}.json`)
    .then(response => response.json())
    .then(data => {
      if (!data) {
        return res.status(404).json({ok: false, message: "usuário não encontrado"});
      }
      
      saldoMoedas = Number(data.moedas);
      if (senha != data.senha) {
        return res.status(400).json({ok: false, message: "senha nao corresponde"});
      }

      fetch(`https://caiolibs.vercel.app/api/keyChecked.js?id=Lojei&chave=${codigo}`)
        .then(response => response.text())
        .then(resposta => {
          if (resposta === "true") {
            saldoMoedas += Number(pacote);
            fetch(`${usuarios}/${nome}/moedas.json`, {
              method: "PUT",
              headers: {"Content-type": "application/json"},
              body: JSON.stringify(saldoMoedas)
            })
            .then(() => {
              return res.status(200).json({ok: true, message: "pacote entregue!!"});
            })
            .catch(error => {
              return res.status(500).json({ok: false, message: "erro ao atualizar moedas"});
            });
          } else {
            return res.status(404).json({ok: false, message: "codigo nao encontrado"});
          }
        })
        .catch(error => {
          return res.status(500).json({ok: false, message: "erro ao verificar código"});
        });
    })
    .catch(error => {
      return res.status(500).json({ok: false, message: "erro ao buscar usuário"});
    });
}
