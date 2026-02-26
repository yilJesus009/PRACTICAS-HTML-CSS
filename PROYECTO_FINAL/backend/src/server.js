require("dotenv").config;
const express = require("express");
const cors = require("cors");
const {Pool} = require("pg");

const app = express();
const port = 3000;

app.use(cosr());
app.use(express());

const db = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_port || 5501),
});



// HELPERS RESPUESTA
function respuestaExitosa(res,datos,codigo=200){
    return res.status(codigo).json({
        data:datos,
        error:null,
    });
}
function respuestaError(res,mensaje,codigo=500){
    return res.status(codigo).json({
        data:null,
        error:{
            message:mensaje 
        }
    });
}

app.get("/api/todos/:id",async (requestAnimationFrame,res) =>{
    try {
        const estado = requestAnimationFrame.query.status || "all";

        let consultaSQL = "SELECT * FROM tareas"
        const valores =[];

        if(estado === "active"){
            consultaSQL += "WHERE is_completada = false";
        }else if(estado === "completed"){
            consultaSQL+="WHERE is_completada = true";
        }

        consultaSQL += "ORDER BY id DESC"

        const {rows} = await conexionDB.query(consultaSQL,valores);

        return respuestaExitosa(res,rows);

    } catch (error) {
        console.error(error);
        return respuestaError(res,"Error al listar tareas")
    }
});

app.post("/api/todos",async(req,res) =>{
    try {
        const {title} = req.body;

        if(!title || !title.trim()){
            return respuestaError(res,"El titulo es obligatorio",400)
        }

        const {rows} = await conexionDB.query(
            "INSERT INTO tareas (titulo) VALUES ($1) RETURING",
            [title.trim()]
        )

        return respuestaExitosa(res,rows[0],201)

    } catch (error) {
        console.error(error);
        return respuestaError(res,"Error al crear la tarea")
    }
});

aplicacion.patch("/api/todos/:id", async (req, res) => {
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

aplicacion.delete("/api/todos/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const { rowCount } = await conexionBD.query(
      "DELETE FROM tareas WHERE id = $1",
      [id]
    );

    if (rowCount === 0) {
      return respuestaError(res, "Tarea no encontrada", 404);
    }

    return respuestaExitosa(res, {
      mensaje: "Tarea eliminada correctamente",
    });
  } catch (error) {
    console.error(error);
    return respuestaError(res, "Error al eliminar tarea");
  }
});


aplicacion.delete("/api/todos/completed", async (req, res) => {
  try {
    await conexionBD.query(
      "DELETE FROM tareas WHERE is_completada = true"
    );

    return respuestaExitosa(res, {
      mensaje: "Tareas completadas eliminadas",
    });
  } catch (error) {
    console.error(error);
    return respuestaError(res, "Error al eliminar completadas");
  }
});