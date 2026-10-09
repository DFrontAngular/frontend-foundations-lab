import { createAppServer } from './app-server.mjs';

const args = new Set(process.argv.slice(2));
const portArgumentIndex = process.argv.indexOf('--port');
const portFromArgument = portArgumentIndex >= 0 ? Number(process.argv[portArgumentIndex + 1]) : undefined;
const port = Number.isInteger(portFromArgument) ? portFromArgument : Number(process.env.PORT ?? 4173);
const showSolutions = args.has('--solutions');

const server = createAppServer({ showSolutions });

server.listen(port, '127.0.0.1', () => {
  console.log(`Frontend Foundations Lab: http://localhost:${port}`);
  console.log(`API local: http://localhost:${port}/api/products`);
  console.log(showSolutions ? 'Modo mentor: soluciones habilitadas.' : 'Modo alumno: soluciones bloqueadas.');
});

function shutdown(signal) {
  console.log(`\n${signal}: cerrando servidor...`);
  server.close((error) => {
    if (error) {
      console.error(error);
      process.exitCode = 1;
    }
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
