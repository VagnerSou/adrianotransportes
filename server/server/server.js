import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);

// Inicializa o Socket.IO permitindo conexões (CORS)
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// Bancos de dados temporários (em memória)
let motoristas = [];
let corridas = [];

app.get("/", (req, res) => {
  res.send("Servidor rodando");
});

// Gerenciamento de conexões Socket.IO
io.on("connection", (socket) => {
  console.log(`Usuário conectado: ${socket.id}`);

  // Evento para registrar o motorista quando ele entra no app
  socket.on("registrar-motorista", (dados) => {
    // Evita duplicar o mesmo motorista
    const jaExiste = motoristas.some(m => m.socketId === socket.id);
    if (!jaExiste) {
      motoristas.push({
        socketId: socket.id,
        nome: dados.nome,
        disponivel: true
      });
    }
    io.emit("motoristas-atualizados", motoristas);
  });

  // --- SEU CÓDIGO CORRIGIDO E OTIMIZADO ---

  socket.on("solicitar-corrida", (corrida) => {
    // Busca o primeiro motorista que esteja disponível
    const motoristaDisponivel = motoristas.find(m => m.disponivel);

    if (!motoristaDisponivel) {
      socket.emit("sem-motorista");
      return;
    }

    const novaCorrida = {
      id: Date.now(),
      passageiro: corrida.passageiro,
      origem: corrida.origem,
      destino: corrida.destino,
      status: "aguardando",
      passageiroSocketId: socket.id // Salva o ID do passageiro para responder direto a ele depois
    };

    corridas.push(novaCorrida);

    // Envia a proposta de corrida APENAS para o motorista selecionado
    io.to(motoristaDisponivel.socketId).emit("nova-corrida", novaCorrida);
  });

  socket.on("aceitar-corrida", (corrida) => {
    const index = corridas.findIndex(c => c.id === corrida.id);

    if (index !== -1) {
      corridas[index].status = "aceita";
      
      // Otimização: Muda o status do motorista para INDISPONÍVEL para ele não receber outras corridas
      const motoristaIndex = motoristas.findIndex(m => m.socketId === socket.id);
      if (motoristaIndex !== -1) {
        motoristas[motoristaIndex].disponivel = false;
        io.emit("motoristas-atualizados", motoristas);
      }

      // Notifica o passageiro específico que a corrida dele foi aceita
      io.to(corridas[index].passageiroSocketId).emit("corrida-aceita", corridas[index]);
    }
  });

  socket.on("finalizar-corrida", (corrida) => {
    const index = corridas.findIndex(c => c.id === corrida.id);

    if (index !== -1) {
      corridas[index].status = "finalizada";

      // Otimização: Torna o motorista DISPONÍVEL novamente
      const motoristaIndex = motoristas.findIndex(m => m.socketId === socket.id);
      if (motoristaIndex !== -1) {
        motoristas[motoristaIndex].disponivel = true;
        io.emit("motoristas-atualizados", motoristas);
      }

      // Notifica o passageiro que a corrida terminou
      io.to(corridas[index].passageiroSocketId).emit("corrida-finalizada", corridas[index]);
    }
  });

  socket.on("disconnect", () => {
    // Remove o motorista da lista se ele desconectar
    const index = motoristas.findIndex(m => m.socketId === socket.id);

    if (index !== -1) {
      motoristas.splice(index, 1);
    }

    // Atualiza a lista de motoristas ativos para todo mundo
    io.emit("motoristas-atualizados", motoristas);
    console.log(`Usuário desconectado: ${socket.id}`);
  });
});

// ATENÇÃO: Para o Socket.IO funcionar, você deve rodar o "server.listen" e não o "app.listen"
server.listen(3000, () => {
  console.log("Servidor iniciado na porta 3000");
});