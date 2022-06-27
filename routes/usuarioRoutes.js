import express from "express";
import {
  crearUsuario,
  autenticarUsuario,
  confirmarUsuario,
  recuperarPassword,
  comprobarToken,
  nuevoPassword,
  perfil,
} from "../controllers/usuarioController.js";
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

// creacion, registro y confirmación de usuarios

router.post("/", crearUsuario);
router.post("/login", autenticarUsuario);
router.get("/confirmar/:token", confirmarUsuario);
router.post("/recuperar", recuperarPassword);
// router.get("/recuperar/:token", comprobarToken);
// router.post("/recuperar/:token", nuevoPassword);

router.route("/recuperar/:token").get(comprobarToken).post(nuevoPassword);

// validar que este autenticado

router.get("/perfil", checkAuth, perfil);

export default router;
