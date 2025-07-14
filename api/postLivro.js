export default function handler(req, res) {
  // Configura CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = "https://feed-78c44-default-rtdb.firebaseio.com/livros";

  if (req.method === "POST") {
    const { dados } = req.body;
    const API_KEY_IA = "inNJuHmF7ffkiZBxdN28";
    
    // Pega os primeiros 150 caracteres do conteúdo
    const textoAvaliar = dados.conteudo.substring(0, 150);
    const meu_prompt = `Responda apenas com "true" ou "false" e nada mais. Nenhum comentário, explicação ou outro texto. True se o texto tiver palavras muito repetidas (a cada 2 ou 3 palavras), estiver vazio ou tiver caracteres aleatórios. Caso contrário, responda false. Texto: "${textoAvaliar}"`;

    fetch("https://api.spiderx.com.br/api/ai/gemini?api_key=" + API_KEY_IA, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: meu_prompt }),
    })
      .then(r => r.json())
      .then(data => {
        const analise = data.response.toLowerCase().trim();

        if (analise !== "false") {
          return res.status(200).json({ message: "Texto recusado", analise });
        }

        // Se aprovado, envia para o Firebase
        fetch(`${url}/${dados.id}.json`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados),
        })
          .then(response => response.json())
          .then(() => res.status(200).json({ ok: true, message: "Sucesso!", analise }))
          .catch(() => res.status(500).json({ ok: false, message: "Erro ao encaminhar ao banco." }));
      })
      .catch(() => res.status(200).json({ message: "Erro na análise" }));
  }
  else if (req.method === "GET") {
    fetch(`${url}.json`)
      .then(response => response.json())
      .then(data => res.status(200).json(data))
      .catch(() => res.status(500).json({ ok: false, message: "Erro ao acessar." }));
  }
  else {
    res.status(405).json({ ok: false, message: "Método não permitido." });
  }
}