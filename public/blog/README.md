# Imágenes de los artículos del blog

Sube aquí la foto de cada artículo. **El nombre del archivo debe ser exactamente
el nombre del post (su slug) con extensión `.jpg`** y la imagen se vincula sola
—no hay que tocar código.

## Cómo funciona

- El post `src/content/blog/<slug>.md` busca automáticamente la imagen en
  `public/blog/<slug>.jpg`.
- Mientras no exista la foto, el artículo muestra un recuadro placeholder de
  marca (el espacio ya queda reservado).
- En cuanto subes `public/blog/<slug>.jpg`, aparece en el post y en el listado.

## Relación de aspecto (importante)

Todas las imágenes se muestran en **16:9** recortando al centro (`object-fit:
cover`), así que **siempre se ven con la misma proporción** sin importar el
tamaño original. Para evitar recortes no deseados, sube fotos horizontales en
16:9. Tamaño recomendado: **1600 × 900 px** (o cualquier múltiplo: 1920×1080).

## Nombres de archivo esperados (uno por artículo)

```
cada-cuanto-hacer-examen-de-la-vista.jpg
como-elegir-armazones-segun-tu-rostro.jpg
como-poner-quitar-limpiar-lentes-esclerales.jpg
cuanto-dura-un-examen-de-la-vista.jpg
donde-hacer-examen-de-la-vista-en-tijuana.jpg
lentes-esclerales-despues-trasplante-cornea.jpg
lentes-esclerales-para-queratocono.jpg
lentes-esclerales-que-son-y-para-quien-son.jpg
lentes-esclerales-vs-rigidos-hibridos-queratocono.jpg
mitos-de-los-ojos.jpg
precio-lentes-esclerales-mexico.jpg
presbicia-o-vista-cansada.jpg
que-es-topografia-corneal.jpg
que-incluye-un-examen-de-la-vista.jpg
quien-es-candidato-lentes-esclerales.jpg
sintomas-queratocono.jpg
vision-borrosa-de-lejos.jpg
```

## ¿Necesitas usar PNG o WEBP en algún post?

La convención usa `.jpg`. Si para un artículo específico subes la imagen en otro
formato (por ejemplo `.png` o `.webp`), agrega esta línea al frontmatter de ese
`.md` para apuntar al archivo correcto:

```yaml
image: "/blog/mi-post.webp"
```
