export default function handler (req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET) {
    return res.status(405).json({ erro: "Método não permitido" });
  }


   const database = "https://feed-78c44-default-rtdb.firebaseio.com/users";

const { nome } = req.query 

fetch(`${database}/moedas.json`).then(response => response.json())
.then(data => {

 return res.status(200).send(data)


})

}