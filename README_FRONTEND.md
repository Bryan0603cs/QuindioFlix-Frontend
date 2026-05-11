# QuindioFlix Angular Frontend

Frontend Angular construido con Atomic Design para consumir el backend QuindioFlix Spring Boot + Oracle.

## Requisitos

- Node.js 20+
- Angular CLI 18+
- Backend corriendo en `http://localhost:8080`
- Oracle cargado con los scripts del proyecto

## Ejecución local

```bash
npm install
npm start
```

Abrir:

```text
http://localhost:4200
```

El archivo `proxy.conf.json` redirige `/api` hacia `http://localhost:8080`, por eso el entorno usa `apiUrl: '/api'`.

## Usuario de prueba

```json
{
  "email": "usuario1@mail.com",
  "password": "Password123"
}
```

## Estructura Atomic Design

```text
src/app/shared/atoms
src/app/shared/molecules
src/app/shared/organisms
src/app/shared/templates
src/app/pages
src/app/core
```

## Paleta visual

- Negro principal: `#050505`, `#0a0a0f`, `#11111a`
- Azul QuindioFlix: `#00038C`
- Texto: `#f8fafc`, `#a1a1aa`

## Sobre imágenes y Cloudinary

El backend actual solo expone `avatar` en perfiles. No expone `posterUrl`, `imagenUrl` ni endpoints de subida Cloudinary para contenido. Por eso el frontend incluye posters visuales generados por CSS y usa el campo `avatar` cuando existe. Si luego agregan Cloudinary al backend, solo se debe ampliar los modelos `ContenidoResponse`/`CrearContenidoCommand` con `posterUrl` o `cloudinaryPublicId` y reemplazar la función `posterStyle()`.
