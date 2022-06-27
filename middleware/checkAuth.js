import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

const checkAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // gracias al id que nos devuelve el token, buscamos el usuario en la base de datos
      req.usuario = await Usuario.findById(decoded.id).select(
        "-password -confirmado -token -createdAt -updatedAt -__v"
      );

      return next();
    } catch (error) {
      return res.status(401).json({
        msg: "Token no válido",
      });
    }
  }

  if (!token) {
    const error = new Error("No autorizado");
    return res.status(401).json({
      msg: error.message,
    });
  }

  next();
};

export default checkAuth;
