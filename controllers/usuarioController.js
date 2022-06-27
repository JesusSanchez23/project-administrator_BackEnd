import Usuario from "../models/Usuario.js";
import generarId from "../helpers/generarId.js";
import bcrypt from "bcrypt";
import generarJWT from "../helpers/generarJWT.js";
import { emailRegistro } from "../helpers/email.js";
import { passworEmail } from "../helpers/passwordEmail.js";

const crearUsuario = async (req, res) => {
  // const { nombre, password, email } = req.body;
  const { email } = req.body;
  const usuarioExistente = await Usuario.findOne({ email });
  if (usuarioExistente) {
    const error = new Error("El usuario ya esta registrados");
    res.status(400).json({
      msg: error.message,
    });
    return;
  }
  try {
    const usuario = new Usuario(req.body);
    usuario.token = generarId();

    await usuario.save();

    // enviar el email de confirmacion

    emailRegistro({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token,
    });

    res.json({
      msg: "Usuario creado Correctamente, Revisa tu Email",
    });
  } catch (error) {
    console.log(error);
  }
};

const autenticarUsuario = async (req, res) => {
  const { email, password } = req.body;

  const usuarioExiste = await Usuario.findOne({ email });

  if (!usuarioExiste) {
    const error = new Error("El usuario no esta registrado");

    return res.status(400).json({
      msg: error.message,
    });
  }
  // comprobar si el usuario esta confirmado
  if (!usuarioExiste.confirmado) {
    const error = new Error("El usuario no esta confirmado");

    return res.status(400).json({
      msg: error.message,
    });
  }

  //comprobar psw, el método se crea en el modelo de Usuario
  const passwordValida = await usuarioExiste.comprobarPassword(password);
  if (!passwordValida) {
    const error = new Error("La contraseña no es correcta");

    return res.status(400).json({
      msg: error.message,
    });
  }

  // si todas las validaciones pasan
  return res.status(200).json({
    id: usuarioExiste._id,
    email: usuarioExiste.email,
    nombre: usuarioExiste.nombre,
    token: generarJWT(usuarioExiste._id),
  });
};

const confirmarUsuario = async (req, res) => {
  // token es ala variable que se le pasa por la url que declaramos en usuarioRoute
  const { token } = req.params;

  const usuarioConfirmar = await Usuario.findOne({ token });

  if (!usuarioConfirmar) {
    const error = new Error("Token no válido");
    return res.status(403).json({
      msg: error.message,
    });
  }

  try {
    usuarioConfirmar.confirmado = true;
    usuarioConfirmar.token = "";

    await usuarioConfirmar.save();

    res.json({
      msg: "Usuario confirmado Correctamente",
    });
  } catch (error) {
    console.log(error.message);
  }
};

const recuperarPassword = async (req, res) => {
  const { email } = req.body;

  const validarUsuario = await Usuario.findOne({ email });

  if (!validarUsuario) {
    const error = new Error("El usuario no existe");
    return res.status(400).json({
      msg: error.message,
    });
  }

  try {
    validarUsuario.token = generarId();

    await validarUsuario.save();
    // enviar el emai

    passworEmail({
      email: validarUsuario.email,
      nombre: validarUsuario.nombre,
      token: validarUsuario.token,
    });

    return res.json({
      msg: "Se ha enviado un correo para recuperar la contraseña",
      validarUsuario,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const comprobarToken = async (req, res) => {
  const { token } = req.params;
  const validarToken = await Usuario.findOne({ token });

  if (validarToken) {
    res.json({
      msg: "Token válido",
    });
  } else {
    const error = new Error("Token no válido");
    return res.status(404).json({
      msg: error.message,
    });
  }
};

const nuevoPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const usuarioRecuperar = await Usuario.findOne({ token });

  if (!usuarioRecuperar) {
    const error = new Error("Token no válido");
    return res.status(400).json({
      msg: error.message,
    });
  }

  try {
    usuarioRecuperar.password = password;
    usuarioRecuperar.token = "";
    await usuarioRecuperar.save();
    return res.json({
      msg: "Contraseña actualizada",
    });
  } catch (error) {
    console.log(error);
  }
};

const perfil = async (req, res) => {
  const { usuario } = req;
  // console.log(usuario);

  res.json({
    id: usuario._id,
    nombre: usuario.nombre,
    email: usuario.email,
  });
};

export {
  crearUsuario,
  autenticarUsuario,
  confirmarUsuario,
  recuperarPassword,
  comprobarToken,
  nuevoPassword,
  perfil,
};
