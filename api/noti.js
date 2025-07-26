export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method !== "GET") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const API_KEY_IA = "inNJuHmF7ffkiZBxdN28";
  const ONESIGNAL_APP_ID = "f93af6e2-13cf-4acd-abaf-af917b183a60";
  const ONESIGNAL_API_KEY = "os_v2_app_7e5pnyqtz5fm3k5pv6ixwgb2mabef7dzvdleabntwcakxrvm36lmutwwn44sbuhm2wccy7amuhxmhmkdi7crwguxteya7b34jeqfj5y";

  const promptNotificacao = `
Manda uma notificação zoeira pro app de livros indies Bookish.
cuidado pra não mencionar outros apps que não seja o "Bookish". 
Sem explicação, sem enrolação, só a mensagem pronta, como se tivesse vindo direto do sistema, e não pode ser igual a anterior.
Estilo sarcástico, engraçado e criativo. Pode usar emoji, mas sem parecer notinha de rodapé de escola.
tente ao máximo não ser repetitivo.
E nem vem com “aqui está” ou qualquer introdução.`.trim();

  // 1. Gera mensagem zoeira com IA
  fetch("https://api.spiderx.com.br/api/ai/gemini?api_key=" + API_KEY_IA, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: promptNotificacao }),
  })
    .then((r) => r.json())
    .then((data) => {
      const mensagem = data.response;

      // 2. Envia pro OneSignal
      return fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${ONESIGNAL_API_KEY}`,
        },
        body: JSON.stringify({
          app_id: ONESIGNAL_APP_ID,
          included_segments: ["All"], // ou use include_player_ids se quiser mandar só pra alguém específico
          headings: { en: "Bookish 📚" },
          contents: { en: mensagem },
        }),
      })
        .then((r) => r.json())
        .then((notificacao) => {
          return res.status(200).json({
            sucesso: true,
            mensagem,
            id_notificacao: notificacao.id,
          });
        });
    })
    .catch((err) => {
      console.error("Erro geral:", err);
      return res.status(500).json({ erro: "Falha ao gerar ou enviar notificação" });
    });
}