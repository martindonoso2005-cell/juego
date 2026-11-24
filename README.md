# Juego de Salto por Voz (Mic-Runner)
**Asignatura:** Taller de Interfaces (2026) | Universidad Adolfo Ibáñez  
**Estudiante:** Martín Donoso  
**Aplicación web:** [Jugar](https://martindonoso2005-cell.github.io/juego/)

---

## Descripción
Juego arcade de estilo retro que se controla solo con la voz: el personaje corre solo y salta cuando dices **"hola"** al micrófono. Hay que esquivar los obstáculos el mayor tiempo posible; cada obstáculo superado suma un punto y se guarda el récord de la partida.

## Cómo jugar
1. Abre el [juego](https://martindonoso2005-cell.github.io/juego/) en **Chrome o Edge** y acepta el permiso del micrófono.
2. Di **"hola"** fuerte para saltar.
3. Si chocas con un obstáculo termina la partida; vuelve a empezar e intenta superar tu récord.

## Tecnología
- **p5.js** para el dibujo y la lógica del juego.
- **Reconocimiento de voz del navegador** (Web Speech API) para detectar la palabra "hola".
- **p5.sound** para el visualizador de la señal del micrófono.

## Contenido del repositorio
- `index.html` y `style.css`: la página del juego.
- `sketch.js`: lógica del juego (jugador, obstáculos, puntaje y voz).
- `p5.min.js` y `p5.sound.min.js`: librerías p5.
