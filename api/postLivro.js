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
 const meu_prompt = `Apenas responda com true ou false, sem explicações, sem texto adicional: Este texto tem palavras muito repetitivas?
Texto: "${dados.conteudo}"`;

fetch("https://api.spiderx.com.br/api/ai/gemini?api_key=" + API_KEY_IA, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text: meu_prompt }),
})
  .then((r) => r.json())
  .then((data) => {
    const resposta = String(data.resposta || data.result || data.output || "").toLowerCase().trim();
  analise = resposta 
    if (resposta === "true") {
      return res.status(200).json({message: "Texto recusado"})
    } else if (resposta === "false") {
  
    } else {
   
    }
  })
  .catch((err) => {
    return res.status(200).json({message: "Erro na análise"})
  });


    fetch(`${url}/${dados.id}.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    })
    .then(response => response.json())
    .then(data => {
      return res.status(200).json({ ok: true, message: "Sucesso!" });
    })
    .catch(error => {
      return res.status(500).json({ ok: false, message: "Erro ao encaminhar ao banco." });
    });

    return; // 👈 ISSO AQUI É ESSENCIAL
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