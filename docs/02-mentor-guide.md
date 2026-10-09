# Guía del mentor

## Principio de la formación

El objetivo no es que el participante reproduzca una solución concreta. Debe aprender a descomponer un problema, consultar documentación, implementar, comprobar y explicar.

## Cómo usar el repositorio

1. Ejecuta el diagnóstico inicial.
2. Asigna bloques, no el repositorio completo de una vez.
3. Revisa al menos un ejercicio por bloque en conversación con la persona.
4. Pide una demostración antes de mirar el código.
5. Pide que explique una decisión y una alternativa descartada.
6. Usa el proyecto final como puerta de entrada a Angular.

## Cadencia sugerida

- **Inicio de bloque:** explicación breve de objetivos y fuentes permitidas.
- **Trabajo autónomo:** ejercicios y notas de dudas.
- **Checkpoint:** revisión de 20-30 minutos con pantalla compartida.
- **Cierre:** corrección de un punto concreto y retrospectiva.

No conviertas cada ejercicio en una clase guiada. Si el mentor dicta todos los pasos, se evalúa capacidad de seguir instrucciones, no autonomía.

## Qué observar

### Señales positivas

- inspecciona el DOM y la pestaña Network;
- reproduce errores de forma controlada;
- separa lógica pura de efectos;
- nombra estados y responsabilidades con claridad;
- utiliza la plataforma antes de añadir una dependencia;
- prueba teclado, red lenta, respuestas vacías y errores;
- sabe decir qué desconoce y cómo lo verificaría.

### Señales de riesgo

- copia fragmentos que no puede explicar;
- usa `innerHTML` con datos externos;
- oculta errores con `catch {}`;
- utiliza `any` para desbloquear el compilador;
- añade listeners dentro de renderizados repetidos;
- depende de refrescar la página para recuperar el estado;
- confunde botón, enlace y elemento no interactivo;
- solo prueba el camino feliz.

## Uso de soluciones

Las soluciones son una referencia, no una especificación única.

Recomendación corporativa:

- mueve `solutions/`, `capstone/solution/` y `diagnostic/solution/` a una rama protegida;
- entrega al alumno una rama sin soluciones;
- abre la referencia después de la revisión inicial;
- compara enfoques y trade-offs, no líneas de código.

## Preguntas útiles en revisión

- ¿Qué parte de esta solución pertenece al dominio y cuál al navegador?
- ¿Qué sucede si la API tarda tres segundos?
- ¿Qué ocurre si llegan dos respuestas fuera de orden?
- ¿Por qué este control es un botón y no un enlace?
- ¿Dónde se valida el dato y por qué?
- ¿Qué estado se conserva al recargar?
- ¿Cómo probarías este comportamiento sin llamar a métodos internos?
- ¿Qué cambiarías si el listado tuviera diez mil elementos?

## Adaptación por nivel

### Perfil sin experiencia

Reduce el alcance del capstone y aumenta checkpoints. No elimines HTML semántico, estados HTTP ni accesibilidad.

### Perfil con experiencia en otro framework

Abrevia sintaxis básica, pero conserva ejercicios DOM, eventos, URL, cancelación y TypeScript. Son las áreas que un framework suele ocultar.

### Perfil Angular con lagunas

Ejecuta el diagnóstico. Asigna directamente los bloques fallidos; no obligues a repetir todo el recorrido.

## Qué no exigir antes de Angular

No es necesario dominar:

- descriptors y metaprogramación avanzada;
- generators complejos;
- detalles de implementación del motor JavaScript;
- algoritmos académicos desconectados del trabajo;
- memorización de APIs.

Sí es necesario comprender scope, referencias, asincronía, DOM, HTTP, eventos y tipos en un nivel operativo.
