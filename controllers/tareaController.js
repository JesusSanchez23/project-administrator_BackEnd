import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tarea.js";

const agregarTarea = async (req, res) => {
  const { proyecto } = req.body;

  const proyectoExiste = await Proyecto.findById(proyecto);

  if (!proyectoExiste) {
    const error = new Error("No existe el Proyecto seleccionado");
    return res.status(404).json({
      msg: error.message,
    });
  }

  if (proyectoExiste.creador.toString() !== req.usuario.id) {
    const error = new Error("Sin autorización");
    return res.status(404).json({
      msg: error.message,
    });
  }

  try {
    const tareaAlmacenada = await Tarea.create(req.body);

    // almacenar el ID ne el proyecto
    proyectoExiste.tareas.push(tareaAlmacenada._id);
    await proyectoExiste.save();

    res.json(tareaAlmacenada);
  } catch (error) {
    console.log(error);
  }
};

const obtenerTarea = async (req, res) => {
  const { id } = req.params;

  const buscarTarea = await Tarea.findById(id).populate("proyecto");

  if (!buscarTarea) {
    const error = new Error("No existe la tarea");
    return res.status(404).json({
      msg: error.message,
    });
  }

  if (buscarTarea.proyecto.creador.toString() !== req.usuario.id) {
    const error = new Error("Sin autorización");
    return res.status(403).json({
      msg: error.message,
    });
  }

  return res.json(buscarTarea);
};

const actualizarTarea = async (req, res) => {
  const { id } = req.params;

  const buscarTarea = await Tarea.findById(id).populate("proyecto");

  if (!buscarTarea) {
    const error = new Error("No existe la tarea");
    return res.status(404).json({
      msg: error.message,
    });
  }

  if (buscarTarea.proyecto.creador.toString() !== req.usuario.id) {
    const error = new Error("Sin autorización");
    return res.status(403).json({
      msg: error.message,
    });
  }
  buscarTarea.nombre = req.body.nombre || buscarTarea.nombre;
  buscarTarea.descripcion = req.body.descripcion || buscarTarea.descripcion;
  buscarTarea.prioridad = req.body.prioridad || buscarTarea.prioridad;
  buscarTarea.fechaEntrega = req.body.fechaEntrega || buscarTarea.fechaEntrega;
  try {
    const tareaActualizada = await buscarTarea.save();

    res.json(tareaActualizada);
  } catch (error) {
    console.log(error);
  }
};

const eliminarTarea = async (req, res) => {
  const { id } = req.params;

  const buscarTarea = await Tarea.findById(id).populate("proyecto");

  if (!buscarTarea) {
    const error = new Error("No existe la tarea");
    return res.status(404).json({
      msg: error.message,
    });
  }

  if (buscarTarea.proyecto.creador.toString() !== req.usuario.id) {
    const error = new Error("Sin autorización");
    return res.status(403).json({
      msg: error.message,
    });
  }

  console.log(buscarTarea);

  const proyecto = await Proyecto.findById(buscarTarea.proyecto);
  proyecto.tareas.pull(buscarTarea._id);

  // console.log(proyecto);

  await Promise.allSettled([
    await proyecto.save(),
    await buscarTarea.deleteOne(),
  ]);

  return res.json({
    msg: "Tarea eliminada",
  });
};

const cambiarEstado = async (req, res) => {
  const { id } = req.params;

  const buscarTarea = await Tarea.findById(id).populate("proyecto");

  if (!buscarTarea) {
    const error = new Error("No existe la tarea");
    return res.status(404).json({
      msg: error.message,
    });
  }

  if (
    buscarTarea.proyecto.creador.toString() !== req.usuario.id.toString() &&
    !buscarTarea.proyecto.colaboradores.some(
      (colaborador) => colaborador._id.toString() === req.usuario._id.toString()
    )
  ) {
    const error = new Error("Sin autorización");
    return res.status(403).json({
      msg: error.message,
    });
  }

  // console.log(buscarTarea);

  try {
    buscarTarea.estado = !buscarTarea.estado;
    buscarTarea.completado = req.usuario._id;
    await buscarTarea.save();

    // Esto se utiliza porque no detecta el front el ultimo cambio de completado por x personalbar, entonces se consulta la ultima actualizacion y se envian esos datos

    const tareaAlmacenada = await Tarea.findById(id)
      .populate("proyecto")
      .populate("completado");

    res.json(tareaAlmacenada);
  } catch (error) {
    console.log(error);
  }
};

export {
  agregarTarea,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea,
  cambiarEstado,
};
