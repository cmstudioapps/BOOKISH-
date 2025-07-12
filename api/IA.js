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

  const API_KEY = "inNJuHmF7ffkiZBxdN28";
  const { acao, contexto, instrucao } = req.body;

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


if(acao === "corrigir") {
const pre_prompt = `
Corrija os erros gramaticais e ortográficos do texto a seguir. 
Não adicione explicações, nem mensagens extras. 
Retorne apenas o texto corrigido completo, sem rodeios, sem introdução ou conclusão.

Texto: "${contexto}"
${instrucao ? `\nInstruções: "${instrucao}"` : ""}
`.trim();

fetch(`https://api.spiderx.com.br/api/ai/gemini?api_key=${API_KEY}`, {
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
}