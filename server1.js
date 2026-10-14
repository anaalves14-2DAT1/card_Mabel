import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express()

const PORT = process.env.PORT || 3001
const MODELO = "openai/gpt-oss-120b"
const URL_API = "https://api.groq.com/openai/v1/chat/completions"

app.use(express.json())
app.use(cors())
app.use(express.static('public'))

const user = []

app.post('/cadastro', (req, res) => {
    const { usuario, email, senha } = req.body

    if (!usuario || !email || !senha) {
        return res.status(400).json({
            erro: "Preencha todos os campos" })
    }

    if (senha.length < 6) {
        return res.status(400).json({ erro: "A senha precisa ter 6 caracteres ou mais" })
    }

    const emailExiste = user.find((busca) => busca.email.toLowerCase() === email.toLowerCase())

    if (emailExiste) {
        return res.status(409).json({
            erro: "Email já cadastrado"
        })
    }


    console.log(`Recebido, aguarde 5 segundos`)
    user.push({ usuario, email, senha })
    console.log("Usuários no sistema:", user)

    setTimeout(() => {
        res.json({
            "mensagem": "CADASTRO COM SUCESSO",
            "PERFIL": `Usuario @${usuario} cadastrado com o email ${email}`
        });
        console.log(`O usuario cadastrado foi ${usuario}`)
    }, 5000)

})

app.post('/login', (req, res) => {
    const { email, senha } = req.body
    if (!email || !senha) {
        return res.status(400).json({ erro: "Preencha todos os campos" })

    }

    const UsuarioExiste = user.find((busca) => busca.email.toLowerCase() === email.toLowerCase())

    if (!UsuarioExiste || UsuarioExiste.senha !== senha) {

        return res.status(400).json({ erro: "Email ou senha incorretos" })
    }

    return res.json({
        mensagem: "Login realizado com sucesso",
        Usuario: UsuarioExiste.usuario
    })

})

app.post('/chat', async (req, res) => {
    try {
        const API_KEY = process.env.GROQ_API_KEY
        const historico = req.body.historico || [];

        const persona = [
            {
                "role": "system",
                "content": "Você é a Mabel de gravity falls que responde enérgica, otimista, extremamente extrovertida e de forma clara, objetiva e resumida."
            }
        ]
        persona.push(...historico)

        const respostaBruta = await fetch(URL_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: MODELO,
                messages: persona
            })
        });

       

        if (!respostaBruta.ok) {
            return res.status(500).json({ "erro": "Erro ao se comunicar com a Groq" })
        }

         const resultado = await respostaBruta.json();

        return res.json({ resposta: resultado.choices[0].message.content })

    }

    catch (error) {
        return res.status(500).json({ "erro": "Erro com a solicitação ao se comunicar com a Groq" })
    }
})

app.listen(PORT, () => {
    console.log(`servidor rodando na porta ${PORT}`);
});