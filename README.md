# Frontend Foundations Lab

Repositorio formativo para construir una base real de **HTML, CSS, JavaScript, APIs del navegador, HTTP y TypeScript** antes de entrar en Angular.

No pretende enseñar cada rincón del lenguaje. Su objetivo es comprobar que una persona entiende la plataforma web y puede construir una aplicación pequeña sin depender de las abstracciones de un framework.

## Qué incluye

- Una prueba diagnóstica inicial para detectar lagunas antes de asignar el itinerario.
- 22 retos progresivos: 21 ejercicios y un capstone final, todos con starter y criterios de aceptación.
- Soluciones de referencia separadas del trabajo del alumno.
- Una aplicación final sin framework que consume una API CRUD local.
- Portal navegable con progreso guardado en `localStorage`.
- API local con paginación, búsqueda, filtros, ordenación, errores simulados y subida `multipart/form-data`.
- Pruebas automáticas para los ejercicios de lógica y para la infraestructura.
- Ejercicios TypeScript en modo `strict`.
- Rúbrica objetiva para decidir si la persona puede pasar a Angular.
- Guía del mentor, matriz de competencias, checklist de accesibilidad y política de uso de IA.

## Requisitos

- Node.js 22 o superior.
- npm 10 o superior.
- Un navegador moderno.
- Visual Studio Code u otro editor con soporte para JavaScript y TypeScript.

## Arranque

```bash
npm install
npm run dev
```

Abre `http://localhost:4173`.

La API queda disponible bajo el mismo origen, por ejemplo:

```text
http://localhost:4173/api/products
http://localhost:4173/api/categories
http://localhost:4173/api/health
```

Para permitir que el servidor muestre también las soluciones desde el navegador:

```bash
npm run dev:mentor
```

Por defecto, las rutas `/solutions` están bloqueadas en el servidor. Los archivos siguen estando en el repositorio para que un mentor pueda moverlos a una rama privada o eliminarlos del fork del alumnado.

## Comandos

```bash
npm run dev                         # portal, ejercicios y API local
npm run dev:mentor                  # habilita las soluciones en el navegador
npm run list                        # lista ejercicios y comandos
npm run check                       # valida la estructura del repositorio
npm run typecheck                   # comprueba las soluciones TypeScript de referencia
npm test                            # prueba API, estructura y soluciones
npm run verify                      # ejecuta todas las comprobaciones
npm run test:exercise -- 08         # prueba el starter del ejercicio 08
npm run test:exercise -- 08 solution # prueba la solución del ejercicio 08
npm run typecheck:exercise -- 19     # comprueba el starter TypeScript del ejercicio 19
```

## Itinerario recomendado

1. **Diagnóstico:** prueba práctica de 90 minutos para asignar el punto de entrada.
2. **HTML y accesibilidad:** estructura, semántica, formularios y tablas.
3. **CSS:** cascada, box model, Flexbox, Grid, responsive y estados de interacción.
4. **JavaScript:** datos, funciones, módulos, reglas de negocio, errores y asincronía.
5. **Navegador y DOM:** renderizado seguro, eventos, formularios, URL y persistencia.
6. **HTTP:** `fetch`, estados de interfaz, CRUD, cancelación y `FormData`.
7. **TypeScript:** modelado de dominio, `unknown`, genéricos, utility types y uniones discriminadas.
8. **Capstone:** aplicación completa sin framework.
9. **Evaluación:** revisión guiada y decisión de entrada a Angular.

Consulta [docs/01-learning-path.md](docs/01-learning-path.md) para el recorrido detallado.

## Criterio de paso a Angular

La persona no necesita dominar internals avanzados de JavaScript. Sí debe poder:

- construir una interfaz semántica y operable con teclado;
- maquetar sin depender de un framework CSS;
- transformar datos con funciones claras y sin mutaciones accidentales;
- trabajar con DOM, eventos y formularios nativos;
- consumir una API y representar `loading`, `error`, `empty` y `success`;
- implementar operaciones CRUD básicas y gestionar errores;
- modelar datos con TypeScript estricto;
- explicar las decisiones tomadas en la aplicación final.

Los mínimos obligatorios están definidos en [docs/07-angular-entry-criteria.md](docs/07-angular-entry-criteria.md).

## Organización

```text
site/          Portal de aprendizaje.
diagnostic/    Prueba inicial con starter, enunciado y referencia.
shared/        Estilos y utilidades compartidas de los ejercicios.
server/        Servidor estático y API local, sin dependencias runtime.
exercises/     Enunciados y starters.
solutions/     Soluciones de referencia.
capstone/      Proyecto final y solución.
docs/          Material para participantes y mentores.
tests/         Pruebas de infraestructura y referencia.
```

## Publicar en un repositorio nuevo

Después de descomprimir y comprobar el proyecto:

```bash
npm install
npm run verify
git init
git add .
git commit -m "chore: bootstrap frontend foundations lab"
git branch -M main
git remote add origin <URL_DEL_REPOSITORIO>
git push -u origin main
```

El primer `npm install` generará `package-lock.json`; conviene versionarlo para mantener instalaciones reproducibles.

## Recomendación para un repositorio corporativo

Mantén `main` con starters y documentación. Mueve `solutions/`, `capstone/solution/` y `diagnostic/solution/` a una rama protegida o a un repositorio privado para mentores. La solución no debe emplearse como plantilla que el alumno copie, sino como referencia de revisión posterior.

## Licencia

MIT.
