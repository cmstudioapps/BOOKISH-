
module.exports = function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const API_KEY = "inNJuHmF7ffkiZBxdN28";
  const { acao, contexto, instrucao } = req.body;
  
  if (acao === "image") {
    const pre_prompt = `Observe o texto que eu desenvolvi até agora e gere uma imagem vertical atendendo também as minhas instruções, porem usando o texto como 'contexto'.
      Minhas instruções: ${instrucao}.
      Meu texto: ${contexto || "sem texto."}`;

    fetch(`https://api.spiderx.com.br/api/ai/pixart?text=${encodeURIComponent(pre_prompt)}&api_key=${API_KEY}`)
      .then((response) => response.json())
      .then((data) => {
        return res.status(200).json({ data.image });
      })
      .catch((error) => {
        return res.status(500).json({ erro: "Erro ao gerar imagem", detalhes: error.message });
      });

  } else {
    return res.status(400).json({ erro: "Ação inválida." });
  }
}