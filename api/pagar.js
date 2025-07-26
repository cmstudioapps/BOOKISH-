// api/pagar.js
import mercadopago from "mercadopago";

export const config = {
  api: {
    bodyParser: true, // garante que o req.body funcione na Vercel
  },
};


mercadopago.configure({
  access_token: "APP_USR-5372909235281533-072608-2738659b389c47900db3b254d77ac826-2585436616", // substitui por teu token
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Só POST, meu chapa" });
  }

  try {
    const { titulo, preco } = req.body;

    const preference = {
      items: [
        {
          title: titulo || "Produto Qualquer",
          unit_price: Number(preco) || 10,
          quantity: 1,
        },
      ],
      back_urls: {
        success: "https://seusite.com/sucesso",
        failure: "https://seusite.com/erro",
        pending: "https://seusite.com/aguarde",
      },
      auto_return: "approved",
    };

    const resposta = await mercadopago.preferences.create(preference);
    return res.status(200).json({ link: resposta.body.init_point });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro no Mercado Pago 😤" });
  }
}
