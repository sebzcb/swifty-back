# Swifty

Swifty se está desarrollando como respuesta a los desafíos de aprobar una asignaturas que enfrentan en ocasiones los estudiantes de educación superior, siendo esta una plataforma web que conectará a los estudiantes para que ellos mismos puedan ayudar a sus compañeros.

## Integrantes

- Sebastián Cahuana
- Gadi Rebolledo

## Requisitos

- Node.js (versión 14 o superior)
- npm (versión 6 o superior)
- PostgreSQL (versión 15)

## Requerimientos funcionales

- Registro de usuario
- Inicio sesión
- Verificación de roles
- Filtro y ordenamiento de resultados
- Chat
- Gestión cuenta de usuario
- Gestión de horarios disponibles
- Reporte a usuarios
- Gestión de grupos de estudio
- Gestión de tutorías
- Búsqueda por palabra clave
- Solicitar tutoría
- Notificaciones
- Calificación y comentarios en tutores
- Gestión de panel de administración

## Requerimientos No funcionales

- **RNF-01**: El sistema debe enviar el correo electrónico de restablecimiento de contraseña en menos de 5 segundos.
- **RNF-02**: El sistema debe usar una base de datos relacional PostgreSQL para almacenar los datos del sistema.
- **RNF-03**: Las contraseñas de los usuarios deben almacenarse encriptadas en la base de datos PostgreSQL.
- **RNF-04**: El sistema debe implementar la siguiente paleta de colores:
  - Color Primario: `#4073cb`
  - Color Secundario: `#9DF3C4`
- **RNF-05**: El sistema debe implementar alertas (Snacks) que en caso de éxito tenga un color de fondo: `#2ecc71` y en caso de error el color de fondo sea: `#c40f3c`.
- **RNF-06**: El sistema debe implementar un diseño responsivo que asegure una experiencia de usuario óptima en dispositivos móviles y de escritorio.
- **RNF-07**: El sistema debe tener entornos separados para desarrollo y producción, cada uno con su propio repositorio de código (frontend y backend).



## Pasos para ejecutar el proyecto

1. Clonar el repositorio:
    ```bash
    git clone https://github.com/sebzcb/swifty-back
    ```

2. Instalar las dependencias:
    ```bash
    npm install
    ```

3. Configurar las variables de entorno:
    - Crear un archivo `.env` en la raíz del proyecto copiando los datos del .env.development y configura:
        ```env
        DB_USER="postgres" # Tu usuario de la base de datos
        DB_NAME="" # Tu Nombre de la base de datos
        DB_PASS="" # Tu Contraseña para conectarse la base de datos
        ```

4. Ejecutar el servidor:
    ```bash
    npm run start
    ```
