export default async function handler(req, res) {
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

    const meu_prompt = `Responda apenas com true ou false. Se o texto tiver palavras muito repetitivas, responda true. Caso contrário, responda false. Sem mais palavras, apenas true ou false. Texto: "${dados.conteudo}"`;

    try {
      // 🔴 Espera a IA responder
      const iaResponse = await fetch("https://api.spiderx.com.br/api/ai/gemini?api_key=" + API_KEY_IA, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: meu_prompt }),
      });

      const iaData = await iaResponse.json();
      const resposta = String(iaData.resposta || iaData.result || iaData.output || "").toLowerCase().trim();

      console.log("Resposta da IA:", resposta);

      // ❌ Se o texto for repetitivo, recusa e para tudo
      if (resposta === "true") {
        return res.status(200).json({ message: "Texto recusado por repetição" });
      }

      // ✅ Só chega aqui se passou na análise da IA
      const salvar = await fetch(`${url}/${dados.id}.json`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });

      const salvarData = await salvar.json();

      return res.status(200).json({ ok: true, message: "Sucesso!" });

    } catch (error) {
      console.error("Erro durante a análise ou salvamento:", error);
      return res.status(500).json({ message: "Erro durante o processamento." });
    }
  }

  if (req.method === "GET") {
    try {
      const resposta = await fetch(`${url}.json`);
      const data = await resposta.json();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ ok: false, message: "Erro ao acessar." });
    }
  }

  return res.status(405).json({ ok: false, message: "Método não permitido." });
}