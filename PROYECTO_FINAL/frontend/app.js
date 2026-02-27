const API_URL = "http://localhost:3000/api/todos";

const lista = document.querySelector(".list");
const input = document.querySelector(".añadir__input");
const boton = document.querySelector(".añadir__button");
const botonMarcarTodas = document.querySelector(".cuaderno__bottom")
const contadorPendientes= document.querySelector("#contadorPendientes");

  //  eventos
document.addEventListener("DOMContentLoaded", iniciarApp);
boton.addEventListener("click", crearTarea);
input.addEventListener("keypress",(e)=>{
  if(e.key === "Enter"){
    crearTarea();
  }
})
botonMarcarTodas.addEventListener("click",marcarTodas)

function iniciarApp() {
  cargarTareas();
}

  //  OBTENER TAREAS

async function cargarTareas() {
  try {
    const respuesta = await fetch(API_URL);
    const datos = await respuesta.json();

    lista.innerHTML = "";

    let pendientes =0;

    datos.data.forEach((tarea) => {
      const elemento = crearElementoTarea(tarea);
      lista.appendChild(elemento);

      if(!tarea.is_completada){
        pendientes++;
      }
    });
    actualizarContador(pendientes);

  } catch (error) {
    console.error("Error al cargar tareas:", error);
  }
}

function actualizarContador(cantidad){
  if(cantidad === 1){
    contadorPendientes.textContent="1 tarea pendiente"
  }else{
    contadorPendientes.textContent=`${cantidad} tareas pendientes`;
  }
}

  //  CREAR ELEMENTO VISUAL
function crearElementoTarea(tarea) {
  const li = document.createElement("li");
  li.classList.add("list__tarea");

  if (tarea.is_completada) {
    li.classList.add("completada");
  }

  li.innerHTML = `
    <input type="checkbox" class="list__check" ${tarea.is_completada ? "checked" : ""}>
    <label class="tarea__texto">${tarea.titulo}</label>
    <button class="list__eliminar">X</button>
  `;

  const checkbox = li.querySelector(".list__check");
  const botonEliminar = li.querySelector(".list__eliminar");

  checkbox.addEventListener("change", () => {
    const estado = checkbox.checked;

    if (estado) {
      li.classList.add("completada");
    } else {
      li.classList.remove("completada");
    }

    actualizarTarea(tarea.id, { completed: estado });
  });

  botonEliminar.addEventListener("click", () => {
    eliminarTarea(tarea.id);
  });

  return li;
}

  //  CREAR TAREA
async function crearTarea() {
  const titulo = input.value.trim();
  if (!titulo) return;

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: titulo }),
    });

    input.value = "";
    cargarTareas();

  } catch (error) {
    console.error("Error al crear tarea:", error);
  }
}

  //  ELIMINAR TAREA
async function eliminarTarea(id) {
  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    cargarTareas();
  } catch (error) {
    console.error("Error al eliminar:", error);
  }
}

  //  ACTUALIZAR TAREA
async function actualizarTarea(id, datos) {
  try {
    await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    cargarTareas();
  } catch (error) {
    console.error("Error al actualizar:", error);
  }
}

// BOTON QUE MARCA TODAS
async function marcarTodas(){
  try {
    await fetch(`${API_URL}/marcar-todas`,{
      method: "PATCH",
    })
    cargarTareas();
  } catch (error) {
    console.error("Error al marcar todas:",error);
  }
}