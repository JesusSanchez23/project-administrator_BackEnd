import {
  obtenerProyectos,
  crearProyecto,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  agregarColaborador,
  eliminarColaborador,
  buscarColaborador,
} from "../controllers/proyectoController.js";
import { check } from "express-validator";

import checkAuth from "../middleware/checkAuth.js";
import validarCampos from "../middleware/validarCampos.js";
import express from "express";

const router = express.Router();

// obtener todos los proyectos
router
  .route("/")
  .get(checkAuth, obtenerProyectos)
  .post(checkAuth, crearProyecto);

router
  .route("/:id")
  .get(checkAuth, obtenerProyecto)
  .put(
    [check("id", "No es un ID válido").isMongoId(), validarCampos, checkAuth],
    editarProyecto
  )
  .delete(
    [check("id", "No es un ID válido").isMongoId(), validarCampos, checkAuth],
    eliminarProyecto
  );

router.post("/colaboradores", checkAuth, buscarColaborador);
router.post("/colaboradores/:id", checkAuth, agregarColaborador);
router.post("/eliminar-colaborador/:id", checkAuth, eliminarColaborador);
export default router;
