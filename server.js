require("dotenv").config();

const express = require("express");
const path = require("path");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const PROMPT_IA = `
Você é a NEXA, uma inteligência artificial criada pela Nexa Agency Enterprises.

Sua personalidade:
- Inteligente, amigável e profissional.
- Responda em português do Brasil, salvo quando o usuário pedir outro idioma.
- Seja clara, objetiva e natural.
- Não diga que é uma pessoa.
- Não invente informações.
- Quando não souber algo, seja honesta.
- Evite respostas excessivamente longas quando uma resposta curta resolver.
- Ajude o usuário com programação, tecnologia, criação, estudos, ideias e assuntos gerais.
- Mantenha uma personalidade própria e consistente.
`;

// ==============================
// MIDDLEWARES
// ==============================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==============================
// ARQUIVOS DO FRONTEND
// ==============================

app.use(express.static(path.join(__dirname, "public")));

// ==============================
// ROTA PRINCIPAL DA IA
// ==============================

app.post("/api/chat", async (req, res) => {
    try {
        const mensagem = req.body?.mensagem;

        console.log("Mensagem recebida:", mensagem);

        if (!mensagem || typeof mensagem !== "string") {
            return res.status(400).json({
                erro: "Mensagem inválida."
            });
        }

        if (!process.env.OPENAI_API_KEY) {
            console.error("OPENAI_API_KEY não encontrada.");

            return res.status(500).json({
                erro: "A chave da OpenAI não está configurada no servidor."
            });
        }

        const resposta = await openai.responses.create({
            model: "gpt-5.4-mini",
            instructions: PROMPT_IA,
            input: mensagem
        });

        const texto = resposta.output_text;

        console.log("Resposta da NEXA:", texto);

        return res.status(200).json({
            resposta: texto
        });

    } catch (erro) {
        console.error("ERRO NA API:", erro);

        return res.status(500).json({
            erro: "Não foi possível obter uma resposta da NEXA.",
            detalhes: erro.message
        });
    }
});

// ==============================
// ROTA DE TESTE
// ==============================

app.get("/api/test", (req, res) => {
    res.json({
        status: "online",
        mensagem: "Servidor da NEXA funcionando corretamente."
    });
});

// ==============================
// TRATAMENTO DE ROTAS NÃO ENCONTRADAS
// ==============================

app.use((req, res) => {
    if (req.path.startsWith("/api/")) {
        return res.status(404).json({
            erro: "Rota da API não encontrada."
        });
    }

    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ==============================
// TRATAMENTO GLOBAL DE ERROS
// ==============================

app.use((erro, req, res, next) => {
    console.error("ERRO GLOBAL:", erro);

    if (res.headersSent) {
        return next(erro);
    }

    res.status(500).json({
        erro: "Erro interno do servidor.",
        detalhes: erro.message
    });
});

// ==============================
// INICIAR SERVIDOR
// ==============================

app.listen(PORT, () => {
    console.log("=================================");
    console.log("      NEXA SERVER ONLINE");
    console.log("=================================");
    console.log(`Servidor: http://localhost:${PORT}`);
    console.log(`API:      http://localhost:${PORT}/api/chat`);
    console.log(`Teste:    http://localhost:${PORT}/api/test`);
    console.log("=================================");
});
