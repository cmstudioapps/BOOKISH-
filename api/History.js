
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
  const { nome, dataNascimento } = req.body;

  if(!nome || !dataNascimento) {
return res.status(200).json({resposta: "Ouve um erro."})
  }
const pre_prompt = `Meu nome é ${nome}, nasci em ${dataNascimento}, O que acontecia nesse meu ano de nascimento, como o mundo estava? quais pessoas importantes tinham na epoca, quais eventos marcantes ocorreram? começe contanto em 3 anos antes destacando eventos ou pessoas importantes, e De forma poética conte tudo.`
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

 return res.status(200).json({resposta: data.response.replace("*","")})
   
 }) 

}
      
