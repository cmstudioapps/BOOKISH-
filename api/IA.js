export default async function handler(req, res) {
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

  if (acao !== "image") {
    return res.status(400).json({ erro: "Ação inválida." });
  }

  const pre_prompt = `Observe o texto que eu desenvolvi até agora e gere uma imagem vertical atendendo também as minhas instruções, porém usando o texto como 'contexto'.
Minhas instruções: ${instrucao}.
Meu texto: ${contexto || "sem texto!"}`;

  try {
    const response = await fetch(`https://api.spiderx.com.br/api/ai/pixart?text=${encodeURIComponent(pre_prompt)}&api_key=${API_KEY}`);
    
    if (!response.ok) {
      const erroText = await response.text(); // pega erro completo
      return res.status(500).json({ erro: "Erro na API externa", detalhes: erroText });
    }

    const data = await response.json();

    if (!data?.image) {
      return res.status(500).json({ erro: "Resposta inesperada da API", dadosRecebidos: data });
    }

    return res.status(200).json({ img: data.image });

  } catch (error) {
    return res.status(500).json({ erro: "Erro ao gerar imagem", detalhes: error.message });
  }
}