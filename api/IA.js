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
  consta database = ""
  const API_KEY = "inNJuHmF7ffkiZBxdN28";
  const { acao, contexto, instrucao, pergunta, senha, nome } = req.body;
let moedas = 0
fetch(`https://bookish-ofc.vercel.app/api/logar`, {

method: "POST",
headers: {"Content-Type":"application/json"},
body: JSON.stringify({

senha, nome , acao: "login"
})

}).then(response => response.json())
.then(data => {
 if(data.login === "false") {
 return res.status(200).json({message: "Erro: Não encontramos seu login"})
}

obterMoedas()

}).catch(error => {
return res.status(500).json({message: "erro ao se comunicar com endpoint"})
})

function obterMoedas() {

fetch(``, {

if(moedas < 80) {

return res.status(200)

}
}
if(acao === "pergunta") {

const pre_prompt = `Pergunta: "${pergunta}".
pequena parte do conteúdo do livro: "${contexto}"
`
 fetch("https://api.spiderx.com.br/api/ai/gemini?api_key=inNJuHmF7ffkiZBxdN28", {
 method: "POST",
 headers: {
   "Content-Type": "application/json"
  },
  body: JSON.stringify({
   text: pre_prompt.trim()
  })
 })
 .then((response) => response.json())
 .then((data) => {

return res.status(200).json({resposta: data.response})
}) 

}

  if (acao === "image") {
    

  const pre_prompt = `Observe o texto que eu desenvolvi até agora e gere uma imagem vertical atendendo também as minhas instruções, porém usando o texto como 'contexto'.
Minhas instruções: ${instrucao}.
Meu texto: ${contexto || "sem texto!"}`;

  fetch(`https://api.spiderx.com.br/api/ai/pixart?text=${encodeURIComponent(pre_prompt)}&api_key=${API_KEY}`)
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => {
          res.status(500).json({ erro: "Erro na API externa", detalhes: text });
        });
      }
      return response.json();
    })
    .then(data => {
      if (!data || !data.image) {
        return res.status(500).json({ erro: "Resposta inesperada da API", dadosRecebidos: data });
      }
      res.status(200).json({ img: data.image });
    })
    .catch(error => {
      res.status(500).json({ erro: "Erro ao gerar imagem", detalhes: error.message });
    });
}


if (acao === "corrigir") {
  if (!contexto) return res.status(400).json({ erro: "Texto vazio" });

  const blocos = dividirTexto(contexto, 1000); // Divide o texto a cada 1000 caracteres
  const resultados = [];

  // Função assíncrona para processar cada bloco
  const corrigirBloco = async (bloco) => {
    const pre_prompt = `
Corrija os erros gramaticais e ortográficos do texto a seguir. 
Não adicione explicações, nem mensagens extras. 
Retorne apenas o texto corrigido completo, sem rodeios, sem introdução ou conclusão.

Texto: "${bloco}"
${instrucao ? `\nInstruções: "${instrucao}"` : ""}
    `.trim();

    const resposta = await fetch(`https://api.spiderx.com.br/api/ai/gemini?api_key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text: pre_prompt })
    });

    const data = await resposta.json();
    return data.response || "";
  };

  // Processa blocos um por um (em sequência)
  (async () => {
    for (const bloco of blocos) {
      const corrigido = await corrigirBloco(bloco);
      resultados.push(corrigido);
    }

    const textoFinal = resultados.join(" ").trim();
    return res.status(200).json({ resposta: textoFinal });

  })().catch(err => {
    console.error("🔥 Erro ao corrigir texto:", err);
    return res.status(500).json({ erro: "Erro na correção por blocos" });
  });
}

function dividirTexto(texto, limite = 1000) {
  const paragrafos = texto.split(/\n+/); // quebra por linha/pulando parágrafos
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