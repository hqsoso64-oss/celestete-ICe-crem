# 🍦 Celeste POS - Sistema de Gestión para Retail

![Estado del Proyecto](https://img.shields.io/badge/Estado-Producción-success)
![Tecnología](https://img.shields.io/badge/Google-Apps%20Script-4285F4?logo=google&logoColor=white)

**Celeste POS** es una solución integral de Punto de Venta (POS) y Gestión de Inventario basada en la nube, diseñada específicamente para optimizar la operación de pequeños y medianos comercios como heladerías, cafeterías y negocios de retail.

Desarrollado con una arquitectura **Serverless** utilizando el ecosistema de Google, elimina costos de infraestructura y garantiza alta disponibilidad.

---

## 💡 Beneficios del Sistema

Implementar Celeste POS transforma por completo la administración de tu negocio:
* ⏱️ **Ahorro de Tiempo:** Automatiza tareas repetitivas y reportes manuales, ahorrando decenas de horas semanales en conciliaciones.
* 📈 **Control Total del Negocio:** Monitorea ingresos, gastos, e inventario en tiempo real, desde cualquier lugar y en cualquier dispositivo.
* 🚫 **Prevención de Pérdidas:** El control estricto de recetas e ingredientes evita fugas de inventario y descuadres de caja.
* 🤝 **Mejor Experiencia del Cliente:** Facturación ultra rápida y sin errores que agiliza las filas y mejora la atención.
* 📉 **Cero Costos de Servidor:** Al utilizar Google Workspace, no hay cobros mensuales por hosting o bases de datos externas.

---

## 🚀 Características Principales

### 📊 Dashboard en Tiempo Real
* Visualización instantánea de ventas del día y del mes.
* Gráficos dinámicos (Chart.js) para análisis de métodos de pago y tipos de venta (Mesa/Llevar).
* Alertas automáticas de stock bajo.

### 🛒 Punto de Venta (POS) Ágil e Inteligente
* Interfaz optimizada para pantallas táctiles y escritorio.
* Buscador inteligente de productos.
* Gestión de productos compuestos (ej: Helado de 2 sabores) con descuento de inventario automático.
* **Sistema Avanzado de Pedidos:** 
  * Edición de pedidos recientes directamente desde la interfaz.
  * Modificación de sabores en tiempo real con recálculo automático y restauración de inventario (evitando duplicidades).
  * Detección inteligente de método de pago de pedidos previos.
* Prevención de doble facturación (Double Submission Protection).
* Soporte para múltiples métodos de pago (Efectivo, Transferencias, Tarjetas).

### 📦 Gestión de Inventario Avanzada
* **Producto Directo:** Crea un insumo y publícalo para la venta en un solo paso.
* **Recetas:** Descuento automático de ingredientes (gramos/unidades) al vender un producto final.
* **Anti-Duplicados:** Validación lógica para evitar registros repetidos.
* **Soft Delete:** Sistema de seguridad que evita la pérdida de datos históricos al eliminar productos.

### 🛡️ Seguridad y Auditoría
* **Login de Usuarios:** Identificación de cajeros y administradores.
* **Logs de Auditoría:** Registro automático de cada acción (Venta, Edición, Borrado) en una hoja oculta.
* **Alertas por Correo:** Envío automático de reporte de cierre diario y alertas de stock crítico al administrador.

---

## 🛠️ Tecnologías Utilizadas

* **Backend:** Google Apps Script (JavaScript en la nube).
* **Base de Datos:** Google Sheets (Estructurada como BBDD Relacional).
* **Frontend:** HTML5, CSS3 (Material Design), JavaScript.
* **Librerías:** Chart.js (Gráficos), jQuery, Select2 (Búsquedas).

---

## 📋 Instalación Rápida

Para una configuración completa y detallada, **[lee el archivo SETUP.md](./SETUP.md)**.

### Resumen (30 segundos):
1. Crea un Google Sheet
2. Crea 6 hojas con los nombres exactos (Inventario, Productos, Ventas, Gastos, Sabores de Helados, Activos)
3. Agrega los encabezados en cada hoja (mira SETUP.md)
4. Copia el ID de tu Sheet
5. Abre Google Apps Script desde tu Sheet
6. Copia **Código.gs** y reemplaza el `SPREADSHEET_ID = ""` con tu ID
7. Copia **index.html** como archivo HTML en Apps Script
8. Haz clic en Implementar → Nueva Implementación → Aplicación Web
9. ¡Listo! 🎉

**[→ Lee SETUP.md para instrucciones completas paso a paso](./SETUP.md)**

---

## ⚠️ Problemas Conocidos y Mejoras Futuras

Este proyecto es funcional pero tiene algunas limitaciones de seguridad y UX que serán mejoradas:

- **Autenticación débil:** Actualmente no hay login real. [Leer más...](./FALLAS_Y_MEJORAS.md)
- **Sin permisos granulares:** Todos los usuarios tienen los mismos permisos.
- **Validación limitada:** Algunos datos no se validan completamente antes de guardar.

**[→ Lee FALLAS_Y_MEJORAS.md para lista completa y explicaciones detalladas](./FALLAS_Y_MEJORAS.md)**

---

## 📸 Galería de Capturas

| **Dashboard Principal** | **Punto de Venta (POS)** |
|:---:|:---:|
| ![Dashboard](assets/dashboard.png) | ![POS](assets/pos-punto-de-venta.png) |
| *Vista general de ventas e inventario bajo* | *Interfaz de facturación rápida* |

| **Inventario** | **Gestión de Gastos** |
|:---:|:---:|
| ![Inventario](assets/inventario.png) | ![Gastos](assets/gastos.png) |
| *Control de existencias y recetas* | *Registro de egresos y categorías* |

| **Reportes** | **Activos Fijos** |
|:---:|:---:|
| ![Reportes](assets/reportes.png) | ![Activos](assets/activos-fijos.png) |
| *Histórico de ventas y filtros* | *Control de equipos y mobiliario* |

---

## 📄 Licencia

Este proyecto es de uso libre para fines educativos.
Desarrollado por [John Fredy Muñoz](https://www.linkedin.com/in/jfmuñoz/).

---

## 📞 Soporte

- **¿Cómo instalo?** → Lee [SETUP.md](./SETUP.md)
- **¿Qué fallas tiene?** → Lee [FALLAS_Y_MEJORAS.md](./FALLAS_Y_MEJORAS.md)
- **¿Algún error?** → [Abre un Issue en GitHub](https://github.com/hqsoso64-oss/celestete-ICe-crem/issues)
