require("dotenv").config();

const express = require("express");
const path = require("path");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

console.log("=================================");
console.log("INICIANDO NEXA SERVER");
console.log("=================================");

console.log(
    "API KEY encontrada:",
    process.env.OPENAI_API_KEY ? "SIM" : "NÃO"
);

console.log(
    "API KEY começa com:",
    process.env.OPENAI_API_KEY
        ? process.env.OPENAI_API_KEY.substring(0, 7) + "..."
        : "N/A"
);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const PROMPT_IA = `
Você é a NEXA, uma inteligência artificial criada pela Nexa Agency Enterprises.

Sua personalidade:

- Inteligente, amigável e profissional.
- Responda em português do Brasil.
- Seja clara, objetiva e natural.
- Não diga que é uma pessoa.
- Não invente informações.
- Quando não souber algo, seja honesta.
- Ajude o usuário com programação, tecnologia, criação, estudos, ideias e assuntos gerais.
- Mantenha uma personalidade própria e consistente.
`;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));


// =====================================
// TESTE DIRETO DA OPENAI
// =====================================

app.get("/api/test-openai", async (req, res) => {

    try {

        console.log("TESTANDO OPENAI...");

        const resposta = await openai.responses.create({
            model: "gpt-5.6-luna",
            input: "Responda apenas: conexão funcionando."
        });

        console.log("OPENAI FUNCIONOU!");

        return res.json({
            sucesso: true,
            resposta: resposta.output_text
        });

    } catch (erro) {

        console.error("=================================");
        console.error("ERRO DIRETO DA OPENAI");
        console.error("=================================");

        console.error("Mensagem:", erro.message);
        console.error("Status:", erro.status);
        console.error("Código:", erro.code);
        console.error("Tipo:", erro.type);

        if (erro.error) {
            console.error("Erro API:", erro.error);
        }

        console.error("=================================");

        return res.status(500).json({
            sucesso: false,
            mensagem: erro.message,
            status: erro.status || null,
            codigo: erro.code || null,
            tipo: erro.type || null
        });

    }

});


// =====================================
// CHAT
// =====================================

app.post("/api/chat", async (req, res) => {

    try {

        const mensagem = req.body?.mensagem;

        console.log("");
        console.log("=================================");
        console.log("NOVA MENSAGEM");
        console.log("=================================");
        console.log("Mensagem:", mensagem);

        if (!mensagem || typeof mensagem !== "string") {

            return res.status(400).json({
                erro: "Mensagem inválida."
            });

        }

        if (!process.env.OPENAI_API_KEY) {

            console.error("API KEY NÃO ENCONTRADA.");

            return res.status(500).json({
                erro: "OPENAI_API_KEY não encontrada."
            });

        }

        console.log("Enviando para OpenAI...");

        const resposta = await openai.responses.create({

            model: "gpt-5.6-luna",

            instructions: PROMPT_IA,

            input: mensagem

        });

        console.log("OpenAI respondeu!");

        console.log(
            "Resposta:",
            resposta.output_text
        );

        return res.status(200).json({

            resposta: resposta.output_text

        });

    } catch (erro) {

        console.error("");
        console.error("=================================");
        console.error("ERRO DA OPENAI");
        console.error("=================================");

        console.error("Mensagem:", erro.message);
        console.error("Status:", erro.status);
        console.error("Código:", erro.code);
        console.error("Tipo:", erro.type);

        console.error("Objeto completo:");

        console.error(erro);

        console.error("=================================");
        console.error("");

        return res.status(500).json({

            erro: erro.message || "Erro desconhecido.",

            status: erro.status || null,

            codigo: erro.code || null,

            tipo: erro.type || null

        });

    }

});


// =====================================
// TESTE DO SERVIDOR
// =====================================

app.get("/api/test", (req, res) => {

    res.json({

        status: "online",

        mensagem: "Servidor da NEXA funcionando."

    });

});


// =====================================
// ROTAS
// =====================================

app.use((req, res) => {

    if (req.path.startsWith("/api/")) {

        return res.status(404).json({

            erro: "Rota da API não encontrada."

        });

    }

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );

});


// =====================================
// SERVIDOR
// =====================================

app.listen(PORT, () => {

    console.log("");
    console.log("=================================");
    console.log("      NEXA SERVER ONLINE");
    console.log("=================================");
    console.log(`Servidor: http://localhost:${PORT}`);
    console.log(`Teste: http://localhost:${PORT}/api/test`);
    console.log(`Teste OpenAI: http://localhost:${PORT}/api/test-openai`);
    console.log("=================================");
    console.log("");

});
