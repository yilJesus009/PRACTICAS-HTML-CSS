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
    const { rows } = await conexionBD.query(
      "SELECT * FROM tareas ORDER BY id DESC"
    );

    return respuestaExitosa(res, rows);
  } catch (error) {
    console.error(error);
    return respuestaError(res, "Error al listar tareas");
  }
});

app.listen(PUERTO, () => {
  console.log(`🚀 API corriendo en http://localhost:${PUERTO}`);
});