import { validationResult } from "express-validator";

const validarCampos = (req, res, next) => {
  // revisar errores

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors);
  }

  next();
};

export default validarCampos;
