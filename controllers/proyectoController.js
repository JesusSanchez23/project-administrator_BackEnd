import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tarea.js";
import Usuario from "../models/Usuario.js";

const obtenerProyectos = async (req, res) => {
  const proyectos = await Proyecto.find({
    $or: [
      { colaboradores: { $in: req.usuario } },
      { creador: { $in: req.usuario } },
    ],
  }).select("-tareas");
  // .where("creador")
  // .equals(req.usuario._id);

  res.json(proyectos);
};

const crearProyecto = async (req, res) => {
  const proyecto = new Proyecto(req.body);

  proyecto.creador = req.usuario._id;

  try {
    const proyectoAlmacenado = await proyecto.save();

    res.json(proyectoAlmacenado);
  } catch (error) {
    console.log(error);
  }
};

const obtenerProyecto = async (req, res) => {
  const { id } = req.params;

  const proyecto = await Proyecto.findById(id)
    .populate({
      path: "tareas",
      populate: { path: "completado", select: "nombre" },
    })
    .populate("colaboradores", "nombre email");

  if (!proyecto) {
    const error = new Error("No se encontro el proyecto");

    return res.status(404).json({
      msg: error.message,
    });
  }
  if (
    proyecto.creador.toString() !== req.usuario._id.toString() &&
    !proyecto.colaboradores.some(
      (colaborador) => colaborador._id.toString() === req.usuario._id.toString()
    )
  ) {
    const error = new Error("Acción no válida");
    return res.status(400).json({
      msg: error.message,
    });
  }

  //obtener las tareas del proyecto

  // const tareas = await Tarea.find().where("proyecto").equals(id);

  return res.json(proyecto);
};

const editarProyecto = async (req, res) => {
  const { id } = req.params;

  const proyecto = await Proyecto.findById(id);

  if (!proyecto) {
    const error = new Error("No se encontro el proyecto");

    return res.status(404).json({
      msg: error.message,
    });
  }
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(401).json({
      msg: error.message,
    });
  }

  proyecto.nombre = req.body.nombre || proyecto.nombre;
  proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
  proyecto.cliente = req.body.cliente || proyecto.cliente;

  try {
    const proyectoActualizado = await proyecto.save();

    return res.json(proyectoActualizado);
  } catch (error) {
    console.log(error);
  }
};

const eliminarProyecto = async (req, res) => {
  const { id } = req.params;

  const proyecto = await Proyecto.findById(id);
  // const proyecto = await Proyecto.findByIdAndDelete(id);

  if (!proyecto) {
    const error = new Error("No se encontro el proyecto");

    return res.status(404).json({
      msg: error.message,
    });
  }
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(401).json({
      msg: error.message,
    });
  }

  try {
    await proyecto.deleteOne();
    return res.status(200).json({
      msg: "proyecto eliminado",
    });
  } catch (error) {
    console.log(error);
  }
};

const buscarColaborador = async (req, res) => {
  const { email } = req.body;

  const buscarUsuario = await Usuario.findOne({ email }).select(
    "-password -createdAt -updatedAt -confirmado -token -__v"
  );

  if (!buscarUsuario) {
    const error = new Error("No se encontro el usuario");

    return res.status(404).json({
      msg: error.message,
    });
  }

  res.json(buscarUsuario);
};

const agregarColaborador = async (req, res) => {
  // console.log(req.params);
  const { id } = req.params;
  const proyecto = await Proyecto.findById(id);

  if (!proyecto) {
    const error = new Error("No se encontro el proyecto");

    return res.status(404).json({ msg: error.message });
  }

  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(401).json({ msg: error.message });
  }

  const { email } = req.body;

  const buscarUsuario = await Usuario.findOne({ email }).select(
    "-password -createdAt -updatedAt -confirmado -token -__v"
  );

  if (!buscarUsuario) {
    const error = new Error("No se encontro el usuario");

    return res.status(404).json({
      msg: error.message,
    });
  }

  //  el colaborador no es el admin del proyecto
  if (buscarUsuario._id.toString() === proyecto.creador.toString()) {
    const error = new Error("El creador no puede ser colaborador");

    return res.status(400).json({
      msg: error.message,
    });
  }

  // revisar que no este ya agregado al proyecto
  if (proyecto.colaboradores.includes(buscarUsuario._id)) {
    const error = new Error("El usuario ya esta agregado");

    return res.status(400).json({
      msg: error.message,
    });
  }

  //si todo es correcto, se puede agregar el colaborador
  proyecto.colaboradores.push(buscarUsuario._id);
  await proyecto.save();
  res.json({
    msg: "Colaborador agregado",
  });
};

const eliminarColaborador = async (req, res) => {
  // console.log(req.params);
  const { id } = req.params;
  const proyecto = await Proyecto.findById(id);

  if (!proyecto) {
    const error = new Error("No se encontro el proyecto");

    return res.status(404).json({ msg: error.message });
  }

  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(401).json({ msg: error.message });
  }

  const { email } = req.body;

  //si todo es correcto, se puedeeliminar
  proyecto.colaboradores.pull(req.body.id);
  await proyecto.save();
  res.json({
    msg: "Colaborador Eliminado",
  });
};

export {
  obtenerProyectos,
  crearProyecto,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  agregarColaborador,
  eliminarColaborador,
  buscarColaborador,
};
