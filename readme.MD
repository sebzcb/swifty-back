# Backend Project

Este proyecto proporciona la configuración necesaria para ejecutar el backend.

## Requisitos

- Node.js (versión 14 o superior)
- npm (versión 6 o superior)
- PostgreSQL (versión 15)

## Pasos para ejecutar el proyecto

1. Clonar el repositorio:
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    ```

2. Instalar las dependencias:
    ```bash
    npm install
    ```

3. Crear una base de datos en PostgreSQL:
    ```sql
    CREATE DATABASE nombre_de_tu_base_de_datos;
    ```

4. Restaurar el backup de la base de datos:

    https://drive.google.com/drive/folders/1dIejr3SuEpUWDUGL6OFvk3Cvft9rZjpM?usp=drive_link

5. Ejecutar el servidor de desarrollo:
    ```bash
    npm run dev
    ```

## Notas

- Asegúrate de configurar las variables de entorno necesarias para la conexión a la base de datos en un archivo `.env`.