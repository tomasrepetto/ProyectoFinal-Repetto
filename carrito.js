// Clase "molde" para los productos
class Producto {
  constructor(id, marca, nombre, precio, imagen) {
      this.id = id;
      this.marca = marca;
      this.nombre = nombre;
      this.precio = precio;
      this.imagen = imagen;
  }
}

// Clase simulando la base de datos del e-commerce
class BaseDeDatos {
  constructor() {
      // Array para el catálogo
      this.productos = [];
      //
      this.cargarRegistros();
  }

  async cargarRegistros(){
    const resultado = await fetch("./json/productos.json");
    this.productos = await resultado.json();
    cargarProductos(this.productos);
  }

// Devuelve todo el catálogo de productos
traerRegistros() {
  return this.productos;
  }

// Nos devuelve un producto según el ID
registroPorId(id) {
  return this.productos.find((producto) => producto.id === id);
  }

// Nos devuelve un array con todas las coincidencias que encuentre según el nombre y marca del producto con la palabra que el pasemos como parámetro
registrosPorNombre(palabra) {
  return this.productos.filter((producto) =>
  producto.nombre.toLowerCase().includes(palabra.toLowerCase()) || producto.marca.toLowerCase().includes(palabra.toLowerCase()));
  }

registrosPorCategoria(marca){
  return this.productos.filter((producto) => producto.marca == marca);
  }
}

// Clase carrito para manipular los productos de nuestro carrito
class Carrito {
  constructor() {
      // Storage
      const carritoStorage = JSON.parse(localStorage.getItem("carrito"));
      // Array donde van a estar almacenados todos los productos del carrito
      this.carrito = carritoStorage || [];
      this.total = 0; // Suma total de los precios de todos los productos
      this.cantidadProductos = 0; // La cantidad de productos que tenemos en el carrito
      this.listar();
  }

// Método para saber si el producto ya se encuentra en el carrito
estaEnCarrito({ id }) {
  return this.carrito.find((producto) => producto.id === id);
  }

// Agregar al carrito
agregar(producto) {
  const productoEnCarrito = this.estaEnCarrito(producto);
  // Si no está en el carrito, le mando un push y le agrego la propiedad "cantidad"
  if (!productoEnCarrito) {
      this.carrito.push({ ...producto, cantidad: 1 });
  } else {
    // De lo contrario, le sumo en 1 la cantidad
      productoEnCarrito.cantidad++;
  }
  localStorage.setItem("carrito", JSON.stringify(this.carrito));
  this.listar();
  }

// Quitar del carrito
quitar(id) {
  // Obento el índice de un producto
  const indice = this.carrito.findIndex((producto) => producto.id === id);
  // Si la cantidad es mayor a 1, le resto la cantidad en 1
  if (this.carrito[indice].cantidad > 1) {
      this.carrito[indice].cantidad--;
  } else {
    // Sino, borramos del carrito el producto a quitar
      this.carrito.splice(indice, 1);
  }
  // Actualizo el storage
  localStorage.setItem("carrito", JSON.stringify(this.carrito));
  // Muestro los productos en el HTML
  this.listar();
  }

// Vaciar carrito
vaciar() {
  this.total = 0;
  this.cantidadProductos = 0;
  this.carrito = [];
  localStorage.setItem("carrito", JSON.stringify(this.carrito));
  this.listar();
}

// Renderiza todos los productos en el HTML
listar() {
  // Reiniciamos variables
  this.total = 0;
  this.cantidadProductos = 0;
  divCarrito.innerHTML = "";
  // Recorro producto por producto del carrito, y los muestro en el HTML
  for (const producto of this.carrito) {
      divCarrito.innerHTML += `
          <div class="productoCarrito">
              <div class="imagen">
                <img src="images/${producto.imagen}" />
              </div>
              <h2>${producto.marca}</h2>
              <h2>${producto.nombre}</h2>
              <p>$${producto.precio}</p>
              <p>Cantidad: ${producto.cantidad}</p>
              <a href="#" class="btnQuitar" data-id="${producto.id}">Quitar del carrito</a>
          </div>
      `;
    // Actualizamos los totales
  this.total += producto.precio * producto.cantidad;
  this.cantidadProductos += producto.cantidad;
  }
  if (this.cantidadProductos > 0){
    // Boton comprar visible
    botonComprar.style.display = "block";
  } else{
    // Boton comprar invisible
    botonComprar.style.display = "none";
  }

  // Lista de todos los botones con .querySelectorAll
  const botonesQuitar = document.querySelectorAll(".btnQuitar");
  // Después los recorro uno por uno y les asigno el evento a cada uno
  for (const boton of botonesQuitar) {
      boton.addEventListener("click", (event) => {
      event.preventDefault();
      const idProducto = Number(boton.dataset.id);
      this.quitar(idProducto);
      });
  }
  // Actualizo los contadores del HTML
  spanCantidadProductos.innerText = this.cantidadProductos;
  spanTotalCarrito.innerText = this.total;
  }
}

// Elementos
const spanCantidadProductos = document.querySelector("#cantidadProductos");
const spanTotalCarrito = document.querySelector("#totalCarrito");
const divProductos = document.querySelector("#productos");
const divCarrito = document.querySelector("#carrito");
const inputBuscar = document.querySelector("#inputBuscar");
const botonCarrito = document.querySelector("#ocultar");
const botonComprar = document.querySelector("#botonComprar");
const botonesCategorias = document.querySelectorAll(".btnCategoria");

// Instanciamos la base de datos
const bd = new BaseDeDatos();

// Instaciamos la clase Carrito
const carrito = new Carrito();

botonesCategorias.forEach((boton) =>{
  boton.addEventListener("click", () =>{
    const marca = boton.dataset.marca;
    // Quitar seleccionado
    const botonSeleccionado = document.querySelector(".seleccionado");
    botonSeleccionado.classList.remove("seleccionado");
    // Se lo agrega a este boton
    boton.classList.add("seleccionado");
    if (marca == "Todos"){
      cargarProductos(bd.traerRegistros());
    }else{
      cargarProductos(bd.registrosPorCategoria(marca));
    }
  })
});

// Mostramos el catálogo de la base de datos apenas carga la página
cargarProductos(bd.traerRegistros());

// Función para renderizar productos del catálogo o buscador
function cargarProductos(productos) {
// Vacíamos el div
  divProductos.innerHTML = "";
// Recorremos producto por producto y lo dibujamos en el HTML
  for (const producto of productos) {
      divProductos.innerHTML += `
          <div class="producto">
            <div class="imagen">
              <img src="images/${producto.imagen}" />
            </div>
            <h2>${producto.marca}</h2>
            <h4>${producto.nombre}</h4>
            <p class="precio">$${producto.precio}</p>
          <a href="#" class="btnAgregar" data-id="${producto.id}">Agregar al carrito</a>
          </div>
  `;
  }

// Lista dinámica con todos los botones que haya en nuestro catálogo
const botonesAgregar = document.querySelectorAll(".btnAgregar");

// Recorremos botón por botón de cada producto en el catálogo y le agregamos
// el evento click a cada uno
for (const boton of botonesAgregar) {
  boton.addEventListener("click", (event) => {
    // Evita el comportamiento default de HTML
      event.preventDefault();
    // Guardo el dataset ID que está en el HTML del botón Agregar al carrito
      const idProducto = Number(boton.dataset.id);
    // Uso el método de la base de datos para ubicar el producto según el ID
      const producto = bd.registroPorId(idProducto);
    // Llama al método agregar del carrito
      carrito.agregar(producto);
    // Toastify
    Toastify({
      text: `Se ha añadido ${producto.nombre} al carrito`,
      position: "center",
      gravity: "top",
      duration: 2000,
      style: {
        background: "linear-gradient(to right, #A51C30, #000)",
        color: "#f5f5f5",
        margin: "15px",
        padding: "5px",
        position: "fixed",  
      },
    }).showToast();
    });
  }
}

// Buscador
inputBuscar.addEventListener("input", (event) => {
  event.preventDefault();
  const palabra = inputBuscar.value;
  const productos = bd.registrosPorNombre(palabra);
  cargarProductos(productos);
});


// Toggle para ocultar/mostrar el carrito
botonCarrito.addEventListener("click", (event) => {
  document.querySelector("section").classList.toggle("ocultar");
});

// Botón comprar
botonComprar.addEventListener("click", (event) => {
  event.preventDefault();

  Swal.fire({
    title: "¿Seguro que desea comprar los productos?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, seguro",
    cancelButtonText: "No, no quiero",
  }).then((result) => {
    if (result.isConfirmed) {
      carrito.vaciar();
      Swal.fire({
        title: "¡Compra realizada!",
        icon: "success",
        text: "Su compra fue realizada con éxito.",
        timer: 2000,
      });
    }
  });
});