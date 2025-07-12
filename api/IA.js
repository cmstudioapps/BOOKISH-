export default function handler (req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

const { dados } = req.body 
const { acao, contexto } = dados

if(acao === "image") {

const pre_prompt = `Observe o texto que eu desenvolvi até agora e gere uma imagem vertical atendendo também as minhas instruções, porem usando o texto como 'contexto'.
    Minhas instruções: ${instrucao}.
    Meu texto: ${contexto}
  `


}

}