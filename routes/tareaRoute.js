import {
  agregarTarea,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea,
  cambiarEstado,
} from "../controllers/tareaController.js";
import checkAuth from "../middleware/checkAuth.js";
import validarCampos from "../middleware/validarCampos.js";

import express from "express";
import { check } from "express-validator";

const router = express.Router();

router.post(
  "/",
  [checkAuth, check("proyecto", "ID Invalido").isMongoId(), validarCampos],
  agregarTarea
);
router
  .route("/:id")
  .get(
    [checkAuth, check("id", "Id Invalido").isMongoId(), validarCampos],
    obtenerTarea
  )
  .put([checkAuth, validarCampos], actualizarTarea)
  .delete([checkAuth, validarCampos], eliminarTarea);

router.post("/estado/:id", [checkAuth, validarCampos], cambiarEstado);

export default router;
