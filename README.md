# WP Feed Display

Plugin de WordPress que muestra los posts del sitio en un feed con carga lazy, imagen destacada, extracto y tags. Se integra mediante un bloque Gutenberg configurable.

## Características

- Bloque Gutenberg "Post Feed" con panel de configuración lateral
- Carga lazy con IntersectionObserver (sin paginación)
- Tarjetas con imagen destacada, extracto y tags como pills con link
- Grid responsive (CSS Grid con `auto-fill`)
- Filtros por categoría y/o etiqueta
- Personalización de colores (fondo, texto, acento)
- Posts por carga configurable (1–12)
- Endpoint REST API propio

## Requisitos

- WordPress 6.0+
- PHP 7.4+
- Node.js 18+ (solo para desarrollo)

## Instalación

1. Descargar `wp-feed-display.zip`
2. WordPress → Plugins → Añadir nuevo → Subir plugin
3. Activar el plugin

## Uso

1. Editar cualquier página o post
2. Buscar el bloque **"Post Feed"** en el inserter
3. En el panel lateral configurar:
   - **Colores**: fondo, texto, acento (para tags)
   - **Filtros**: categoría y/o etiqueta específica
   - **Posts por carga**: cuántos posts se cargan cada vez (1–12)
4. Publicar

## Desarrollo

```bash
# Instalar dependencias
npm install --registry https://registry.npmjs.org/

# Modo watch (recarga automática)
npm run start

# Build de producción
npm run build

# Build + zip listo para subir
./build.sh
```

## Estructura del proyecto

```
wp-feed-display/
├── wp-feed-display.php           # Bootstrap del plugin
├── package.json                  # Dependencias (@wordpress/scripts)
├── build.sh                      # Script de build + zip
├── includes/
│   └── class-feed-rest-api.php   # Endpoint REST API
├── src/feed-display/
│   ├── block.json                # Metadatos del bloque
│   ├── index.js                  # Registro del bloque
│   ├── edit.js                   # Editor (panel de controles)
│   ├── save.js                   # Render server-side
│   ├── render.php                # Render PHP
│   ├── style.css                 # Estilos frontend
│   └── editor.css                # Estilos editor
├── assets/js/
│   └── lazy-load.js              # IntersectionObserver + fetch
└── build/feed-display/           # Assets compilados
```

## REST API

### `GET /wp-json/wp-feed-display/v1/posts`

| Parámetro   | Tipo   | Default | Descripción                    |
|-------------|--------|---------|--------------------------------|
| `page`      | int    | 1       | Página de resultados           |
| `per_page`  | int    | 6       | Posts por página               |
| `categories`| string | `""`    | IDs de categorías (separadas por coma) |
| `tags`      | string | `""`    | IDs de etiquetas (separadas por coma) |

**Respuesta:**

```json
[
  {
    "id": 1,
    "title": "Título del post",
    "excerpt": "Extracto del post...",
    "thumbnail": "https://example.com/wp-content/uploads/...",
    "tags": [
      { "name": "WordPress", "link": "https://example.com/tag/wordpress/" }
    ],
    "permalink": "https://example.com/post-ejemplo/"
  }
]
```

## Licencia

GPL v2 o posterior.
