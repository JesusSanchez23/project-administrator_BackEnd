import express from "express";
import dotenv from "dotenv";
import conectarDB from "./config/db.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import proyectoRoute from "./routes/proyectoRoute.js";
import tareaRoute from "./routes/tareaRoute.js";

// para permitir la comunicacion con el frontend 1/2
import cors from "cors";

const app = express();
app.use(express.json());

dotenv.config();
conectarDB();

// para permitir la comunicación con el frontend 2/2
const whiteList = [process.env.FRONTEND_URL];

const corsOption = {
  origin: (origin, callback) => {
    if (whiteList.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("No permitido"));
    }
  },
};

app.use(cors(corsOption));
// app.use(cors({ origin: whiteList }));

// routing

app.use("/api/usuarios", usuarioRoutes);
app.use("/api/proyectos", proyectoRoute);
app.use("/api/tareas", tareaRoute);

const port = process.env.PORT || 4000;

// app.listen(port, () => {
//   console.log(`listening on port ${port}`);
// });

// con socket

const servidor = app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

// socket io

import { Server } from "socket.io";

const io = new Server(servidor, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

io.on("connection", (socket) => {
  console.log("conectado a socket io");

  // definir los eventos

  socket.on("abrir proyecto", (proyecto) => {
    socket.join(proyecto);
  });

  socket.on("nueva tarea", (tarea) => {
    socket.to(tarea.proyecto).emit("tarea agregada", tarea);
  });

  socket.on("eliminar tarea", (tarea) => {
    socket.to(tarea.proyecto).emit("tarea eliminada", tarea);
  });

  socket.on("actualizar tarea", (tarea) => {
    // const { proyecto } = tarea.proyecto._id;

    socket.to(tarea.proyecto._id).emit("tarea actualizada", tarea);
  });

  socket.on("completar tarea", (tarea) => {
    socket.to(tarea.proyecto._id).emit("tarea completada", tarea);
  });
});
