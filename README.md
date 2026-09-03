# Mi Sistema Cloud

Sistema web de gestión de productos creado para la asignatura **Computación en la Nube** del **Instituto Profesional Santo Tomás**.

- **Autor:** Mauricio Lizana
- **Semestre:** Cuarto Semestre

## ¿Qué es?

Página web que permite administrar un inventario de productos: crearlos, verlos, modificarlos y eliminarlos, además de simular compras controlando el stock disponible.

## Estructura del proyecto

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Página de inicio con la tarjeta de presentación y el botón de acceso |
| `productos.html` | Página de gestión de productos |
| `style.css` | Estilos visuales de todo el sistema |
| `script.js` | Lógica de la aplicación (CRUD, compra, búsqueda, etc.) |
| `logo-santotomas.png` | Imagen del logo del instituto |

## Funcionalidades

- **Página de inicio**: presenta el título del sistema y los datos del autor (nombre y semestre). El botón *"Ingresar al sistema"* lleva a la página de gestión.
- **Crear producto**: formulario con nombre, stock, precio y descripción.
- **Leer productos**: tabla con todos los productos registrados.
- **Modificar producto**: editar un producto existente cargando sus datos en el formulario.
- **Eliminar producto**: se solicita confirmación mediante un modal antes de borrar.
- **Resumen de stock**: tabla de resumen con el stock disponible de cada producto y opción de comprar.
- **Control de stock**: si se intenta comprar una cantidad mayor al stock disponible, se muestra un mensaje de error.
- **Precios en pesos chilenos (CLP)**: formato `$12.345`.
- **Buscador**: filtra los productos por nombre.
- **Filtro por stock**: muestra solo disponibles, stock bajo o agotados.
- **Tarjetas de resumen**: total de productos, con stock, agotados y valor del inventario.
- **Confirmación de compra**: modal que muestra cantidad y total a pagar antes de confirmar.

## Cómo funciona el guardado

Los productos se guardan en el navegador mediante `localStorage`, por lo que la información persiste aunque se cierre la página. No requiere servidor ni base de datos.

## Cómo usarlo

Abre `index.html` en un navegador web y haz clic en **"Ingresar al sistema"** para comenzar a gestionar productos.
