export default function handler(req, res) {
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

if (req.method === 'OPTIONS') {
res.status(200).end();
return;
}

const url = "https://feed-78c44-default-rtdb.firebaseio.com/livros";

let analise = 0
if (req.method === "POST") {
  const { dados } = req.body;
  const API_KEY_IA = "inNJuHmF7ffkiZBxdN28";



  fetch("https://caiolibs.vercel.app/ch.js")
    .then(res => res.text())
    .then(js => {
      eval(js); 



   const meu_prompt = `Responda apenas com true ou false. Se o texto tiver palavras muito repetitivas, em branco, ou caracteres aleatórios, responda true. Caso contrário, responda false. Sem mais palavras, apenas true ou false. Texto: "${init(dados.conteudo,100)}"`;

  fetch("https://api.spiderx.com.br/api/ai/gemini?api_key=" + API_KEY_IA, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: meu_prompt }),
  })
    .then(r => r.json())
    .then(data => {
      analise = data.response.toLowerCase().trim();

      if (analise !== "false") {
        return res.status(200).json({ message: "Texto recusado", analise: data.response});
      }

      // SE A IA APROVOU, ENTÃO ENVIA PRO FIREBASE
      fetch(`${url}/${dados.id}.json`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      })
        .then((response) => response.json())
        .then((data) => {
          return res.status(200).json({ ok: true, message: "Sucesso!", analise });
        })
        .catch((error) => {
          return res.status(500).json({ ok: false, message: "Erro ao encaminhar ao banco." });
        });
    })
    .catch((err) => {
      return res.status(200).json({ message: "Erro na análise" });
    });

  return;



    })
    .catch(erro => console.error("Deu ruim:", erro));


  
}
if (req.method === "GET") {
fetch(`${url}.json`)
.then(response => response.json())
.then(data => {
return res.status(200).json(data);
})
.catch(error => {
return res.status(500).json({ ok: false, message: "Erro ao acessar." });
});

return; // 👈 ISSO AQUI TAMBÉM

}

// 👇 Se chegar aqui, é porque o método não é suportado.
return res.status(405).json({ ok: false, message: "Método não permitido." });
}

