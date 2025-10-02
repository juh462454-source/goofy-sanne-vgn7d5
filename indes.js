const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const SECRET_KEY = "biblioteca-secreta";

let livros = [];
let usuarios = [{ nome: "admin", senha: "1234" }];

const autenticar = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(403)
      .json({ mensagem: "Acesso negado. Token ausente ou inválido." });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ mensagem: "Token inválido" });
    req.user = user;
    next();
  });
};

app.post("/login", (req, res) => {
  const { nome, senha } = req.body;
  const usuario = usuarios.find((u) => u.nome === nome && u.senha === senha);

  if (!usuario)
    return res.status(401).json({ mensagem: "Credenciais inválidas" });

  const token = jwt.sign({ nome: usuario.nome }, SECRET_KEY, {
    expiresIn: "1h",
  });
  res.json({ token });
});

app.get("/livros", (req, res) => {
  res.json(livros);
});

app.post("/livros", autenticar, (req, res) => {
  const { titulo, autor } = req.body;
  if (!titulo || !autor) {
    return res
      .status(400)
      .json({ mensagem: "Título e autor são obrigatórios" });
  }

  const livroExistente = livros.find(
    (livro) => livro.titulo === titulo && livro.autor === autor
  );
  if (livroExistente) {
    return res.status(409).json({ mensagem: "Livro já existe no sistema." });
  }

  livros.push({ id: livros.length + 1, titulo, autor });
  res.status(201).json({ mensagem: "Livro criado com sucesso" });
});

app.delete("/livros", autenticar, (req, res) => {
  const { id } = req.body;

  const index = livros.findIndex((livro) => livro.id === id);
  if (index === -1) {
    return res.status(404).json({ mensagem: "Livro não encontrado." });
  }

  livros.splice(index, 1);
  res.json({ mensagem: "Livro deletado com sucesso" });
});

app.get("/", (req, res) => {
  res.send("Bem-vindo à API de Controle de Estoque da Biblioteca!");
});

app.listen(3000, () => console.log("API rodando na porta 3000"));
