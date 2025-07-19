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

  const database = "https://feed-78c44-default-rtdb.firebaseio.com/users";
  const API_KEY = "inNJuHmF7ffkiZBxdN28";
  const { acao, contexto, instrucao, pergunta, senha, nome } = req.body;

  fetch(`https://bookish-ofc.vercel.app/api/logar`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ senha, nome, acao: "login" })
  })
  .then(response => response.json())
  .then(data => {
    if(data.login === "false") {
      return res.status(200).json({message: "Erro: Não encontramos seu login"});
    }

    // Agora verificamos as moedas antes de continuar
    fetch(`${database}/${nome}/moedas.json`)
      .then(response => response.json())
      .then(moedas => {
        if(Number(moedas) < 80) {
          return res.status(400).json({resposta: "Você não tem moedas suficientes pra usar essa função"});
        }

        // Atualiza as moedas primeiro
        let novoValor = Number(moedas) - 80;
        fetch(`${database}/${nome}/moedas.json`, {
          method: "PATCH",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify(novoValor)
        })
        .then(() => {
          // Só depois de atualizar as moedas, processa a ação
          processarAcao();
        })
        .catch(error => {
          console.error("Erro ao atualizar moedas:", error);
          return res.status(500).json({erro: "Falha ao atualizar moedas"});
        });
      })
      .catch(error => {
        console.error("Erro ao obter moedas:", error);
        return res.status(500).json({erro: "Falha ao verificar moedas"});
      });

    function processarAcao() {
      if(acao === "pergunta") {
        const pre_prompt = `Pergunta: "${pergunta}".
        pequena parte do conteúdo do livro: "${contexto}"
        `;
        fetch("https://api.spiderx.com.br/api/ai/gemini?api_key=inNJuHmF7ffkiZBxdN28", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({ text: pre_prompt.trim() })
        })
        .then(response => response.json())
        .then(data => {
          return res.status(200).json({resposta: data.response});
        })
        .catch(error => {
          console.error("Erro na API Gemini:", error);
          return res.status(500).json({erro: "Falha ao processar pergunta"});
        });
      }
      else if(acao === "image") {
        const pre_prompt = `Observe o texto que eu desenvolvi até agora e gere uma imagem vertical atendendo também as minhas instruções, porém usando o texto como 'contexto'.
        Minhas instruções: ${instrucao}.
        Meu texto: ${contexto || "sem texto!"}`;

        fetch(`https://api.spiderx.com.br/api/ai/pixart?text=${encodeURIComponent(pre_prompt)}&api_key=${API_KEY}`)
          .then(response => response.json())
          .then(data => {
            if (!data || !data.image) {
              return res.status(500).json({ erro: "Resposta inesperada da API" });
            }
            res.status(200).json({ img: data.image });
          })
          .catch(error => {
            res.status(500).json({ erro: "Erro ao gerar imagem", detalhes: error.message });
          });
      }
      else if(acao === "corrigir") {
        // ... (seu código existente para correção)
      }
    }
  })
  .catch(error => {
    console.error("Erro na comunicação com endpoint:", error);
    return res.status(500).json({
      message: "erro ao se comunicar com endpoint",
      error: error.message
    });
  });
}