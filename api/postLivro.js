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
    const meu_prompt = `Responda apenas com "true" ou "false" e nada mais. True apenas se o texto estiver sem sentido, for composto por palavras aleatórias, repetir as mesmas palavras exatamente a cada 2-3 palavras (sem variação), ou estiver vazio. Caso contrário, responda false. Texto: "${textoAvaliar}"`;

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




  if (req.method === "GET") {
  const sinopse = decodeURIComponent(req.query.sinopse || "");
  if (!sinopse) {
            return fetch(`${url}.json`)
          .then(response => {
            if (!response.ok) throw new Error(`Erro ao acessar JSON final: ${response.status}`);
            return response.json();
          })
          .then(data => res.status(200).json({ ...data, music: "" }))
          .catch(err => {
            console.error("Erro ao acessar o JSON final:", err);
            return res.status(500).json({ ok: false, message: "Erro ao acessar o JSON final." });
          });
      }
    })
    .catch(err => {
      console.error("Erro geral ao processar:", err);
      return res.status(500).json({ ok: false, message: "Erro geral ao processar.", music: "" });
    });
  }

  fetch("https://api.spiderx.com.br/api/ai/gemini?api_key=inNJuHmF7ffkiZBxdN28", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `Com base nesse texto: "${sinopse}", recomende apenas o nome de uma música internacional e sua letra completa, que combine com a história. Não envie imagens, emojis ou comentários. Apenas o nome e a letra.`
    })
  })
    .then(res => {
      if (!res.ok) throw new Error(`Erro na API Gemini: ${res.status} ${res.statusText}`);
      return res.json();
    })
    .then(geminiData => {
      console.log("Resposta da Gemini:", geminiData);

      if (geminiData?.response) {
        const nomeMusica = geminiData.response.split("\n")[0].replace(/["']/g, "").trim();
        if (!nomeMusica) {
          throw new Error("Nome da música não identificado.");
        }
        console.log("Nome da música extraído:", nomeMusica);

        return fetch(`https://api.spiderx.com.br/api/downloads/play-audio?search=${encodeURIComponent(nomeMusica)}&api_key=inNJuHmF7ffkiZBxdN28`)
          .then(res => {
            if (!res.ok) throw new Error(`Erro na API de áudio: ${res.status} ${res.statusText}`);
            return res.json();
          })
          .then(audioData => {
            let musicUrl = "";
            if (audioData?.url) {
              musicUrl = audioData.url;
            } else {
              console.warn("URL de áudio não encontrada.");
            }

            return fetch(`${url}.json`)
              .then(response => {
                if (!response.ok) throw new Error(`Erro ao acessar JSON final: ${response.status}`);
                return response.json();
              })
              .then(data => res.status(200).json({ ...data, music: musicUrl }))
              .catch(err => {
                console.error("Erro ao acessar o JSON final:", err);
                return res.status(500).json({ ok: false, message: "Erro ao acessar o JSON final." });
              });
          });
      } else {
        // Sem resposta da IA
        console.warn("Campo 'response' ausente na resposta da Gemini.");
        return fetch(`${url}.json`)
          .then(response => {
            if (!response.ok) throw new Error(`Erro ao acessar JSON final: ${response.status}`);
            return response.json();
          })
          .then(data => res.status(200).json({ ...data, music: "" }))
          .catch(err => {
            console.error("Erro ao acessar o JSON final:", err);
            return res.status(500).json({ ok: false, message: "Erro ao acessar o JSON final." });
          });
      }
    })
    .catch(err => {
      console.error("Erro geral ao processar:", err);
      return res.status(500).json({ ok: false, message: "Erro geral ao processar.", music: "" });
    });
}
}