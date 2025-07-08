export default function handler (req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }


const url = "https://feed-78c44-default-rtdb.firebaseio.com/users"

const { acao, nome, senha } = req.body 

if(acao === "login") {

fetch(`${url}/${nome}.json`).then(response => response.json())
.then(data => {

if(data) {

if (senha === data.senha) {

return res.status(200).json({message: "Sucesso no login", login: true})
} else {
return res.status(400).json({message: "erro no login: senha inválida.", login: false})

}

} else {

return res.status(404).json({message: "Usuário não existe"})

}

})
.catch(error => {
return res.status(500).json({message: "erro ao acessar url do banco"})
})

}

}