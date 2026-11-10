# Votación navideña

Aplicación web de votación con tres opciones, resultados compartidos y almacenamiento SQLite persistente.

## Publicación en Render
El archivo render.yaml configura un servicio Node y un disco persistente para la base de datos. Conecta este repositorio en Render y despliega el servicio.

## Límite de voto
Se impide repetir el voto desde el mismo identificador del navegador. Sin autenticación o verificación de identidad no se puede garantizar estrictamente un voto por persona: se puede usar otro dispositivo o borrar los datos del navegador.