import cron from 'node-cron';
import fetchVideos from './fetchUploads.js'; // Importa la función que ya tienes

// Programa la tarea para que se ejecute todos los días a las 12:00 AM
cron.schedule('0 0 * * *', async () => {
  console.log('Ejecutando tarea programada: Actualización de videos');
  await fetchVideos();
  console.log('Actualización completada');
});

// Mantén el proceso corriendo
console.log('Cron job configurado. Esperando la próxima ejecución...');