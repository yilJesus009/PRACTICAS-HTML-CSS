require("dotenv").config();

const express = require("express");
const cors = require("cors");

const conexionBD = require("./db"); 

const app = express();
const PUERTO = 3000;

app.use(cors());
app.use(express.json());




function respuestaExitosa(res, datos, codigo = 200) {
  return res.status(codigo).json({
    data: datos,
    error: null,
  });
}
function respuestaError(res, mensaje, codigo = 500) {
  return res.status(codigo).json({
    data: null,
    error: { message: mensaje },
  });
}


app.get("/api/todos", async (req, res) => {
  try {
    const estado = req.query.status || "all";

    let consultaSQL = "SELECT * FROM tareas";

    if (estado === "active") {
      consultaSQL += " WHERE is_completada = false";
    } else if (estado === "completed") {
      consultaSQL += " WHERE is_completada = true";
    }

    consultaSQL += " ORDER BY id DESC";

    const { rows } = await conexionBD.query(consultaSQL);

    return respuestaExitosa(res, rows);
  } catch (error) {
    console.error(error);
    return respuestaError(res, "Error al listar tareas");
  }
});


app.post("/api/todos", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return respuestaError(res, "El título es obligatorio", 400);
    }

    const { rows } = await conexionBD.query(
      "INSERT INTO tareas (titulo) VALUES ($1) RETURNING *",
      [title.trim()]
    );

    return respuestaExitosa(res, rows[0], 201);
  } catch (error) {
    console.error(error);
    return respuestaError(res, "Error al crear tarea");
  }
});


//  la específica
app.patch("/api/todos/marcar-todas", async (req,res) =>{
  try {
    await conexionBD.query(
      "UPDATE tareas SET is_completada = true WHERE is_completada = false"
    );

    return respuestaExitosa(res, {
      mensaje:"Todas las tareas fueron marcadas como hechas"
    });

  } catch (error) {
    console.error(error);
    return respuestaError(res,"Error al marcar todas las tareas");
  }
});

app.patch("/api/todos/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, completed } = req.body;

    const { rows } = await conexionBD.query(
      `
      UPDATE tareas
      SET 
        titulo = COALESCE($1, titulo),
        is_completada = COALESCE($2, is_completada)
      WHERE id = $3
      RETURNING *
      `,
      [title ?? null, completed ?? null, id]
    );

    if (rows.length === 0) {
      return respuestaError(res, "Tarea no encontrada", 404);
    }

    return respuestaExitosa(res, rows[0]);
  } catch (error) {
    console.error(error);
    return respuestaError(res, "Error al actualizar tarea");
  }
});


app.delete("/api/todos/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const { rowCount } = await conexionBD.query(
      "DELETE FROM tareas WHERE id = $1",
      [id]
    );

    if (rowCount === 0) {
      return respuestaError(res, "Tarea no encontrada", 404);
    }

    return respuestaExitosa(res, { mensaje: "Tarea eliminada" });
  } catch (error) {
    console.error(error);
    return respuestaError(res, "Error al eliminar tarea");
  }
});




app.listen(PUERTO, () => {
  console.log(`🚀 API corriendo en http://localhost:${PUERTO}`);
});