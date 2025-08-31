
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
  const { nome, dat } = req.body;

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
      
