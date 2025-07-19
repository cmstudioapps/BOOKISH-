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

    fetch(`${database}/${nome}/moedas.json`)
    .then(response => response.json())
    .then(moedas => {
      if(Number(moedas) < 80) {
        return res.status(400).json({resposta: "Você não tem moedas suficientes"});
      }

      // DESCONTA PRIMEIRO
      fetch(`${database}/${nome}/moedas.json`, {
        method: "PATCH",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({Number(moedas) - 80})
      })
      .then(() => {
        // DEPOIS EXECUTA A AÇÃO
        if(acao === "pergunta") {
          const pre_prompt = `Pergunta: "${pergunta}".\npequena parte do conteúdo do livro: "${contexto}"`;
          
          fetch("https://api.spiderx.com.br/api/ai/gemini?api_key=inNJuHmF7ffkiZBxdN28", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ text: pre_prompt.trim() })
          })
          .then(response => response.json())
          .then(data => {
            res.status(200).json({resposta: data.response});
          });
        }
        else if(acao === "image") {
          const pre_prompt = `Observe o texto que eu desenvolvi até agora e gere uma imagem vertical atendendo também as minhas instruções, porém usando o texto como 'contexto'.\nMinhas instruções: ${instrucao}.\nMeu texto: ${contexto || "sem texto!"}`;

          fetch(`https://api.spiderx.com.br/api/ai/pixart?text=${encodeURIComponent(pre_prompt)}&api_key=${API_KEY}`)
          .then(response => response.json())
          .then(data => {
            res.status(200).json({ img: data.image });
          });
        }
        else if(acao === "corrigir") {
          if (!contexto) return res.status(400).json({ erro: "Texto vazio" });

          const blocos = dividirTexto(contexto, 1000);
          const resultados = [];

          (async () => {
            for (const bloco of blocos) {
              const pre_prompt = `Corrija os erros gramaticais e ortográficos do texto a seguir.\nNão adicione explicações, nem mensagens extras.\nRetorne apenas o texto corrigido completo.\n\nTexto: "${bloco}"${instrucao ? `\nInstruções: "${instrucao}"` : ""}`;
              
              const resposta = await fetch(`https://api.spiderx.com.br/api/ai/gemini?api_key=${API_KEY}`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ text: pre_prompt })
              });
              const data = await resposta.json();
              resultados.push(data.response || "");
            }

            res.status(200).json({ resposta: resultados.join(" ").trim() });
          })();
        }
      })
      .catch(error => {
        console.error("Erro ao atualizar moedas:", error);
        res.status(500).json({ erro: "Falha ao atualizar moedas" });
      });
    });
  })
  .catch(error => {
    console.error("Erro:", error);
    res.status(500).json({ erro: error.message });
  });

  function dividirTexto(texto, limite = 1000) {
    const paragrafos = texto.split(/\n+/);
    const blocos = [];
    let blocoAtual = "";

    for (const p of paragrafos) {
      if ((blocoAtual + "\n" + p).length > limite) {
        blocos.push(blocoAtual.trim());
        blocoAtual = p;
      } else {
        blocoAtual += "\n" + p;
      }
    }

    if (blocoAtual.trim() !== "") {
      blocos.push(blocoAtual.trim());
    }

    return blocos;
  }
}