const Agenda = require('agenda');

// Replace with your actual MongoDB connection string if you use Agenda with MongoDB
const mongoConnectionString = 'mongodb://127.0.0.1/agendaDB'; 

const agenda = new Agenda({ db: { address: mongoConnectionString, collection: 'bookings' } });

agenda.define('send booking confirmation', async (job) => {
  const { bookingId, email } = job.attrs.data;
  console.log(`Sending confirmation for booking ${bookingId} to ${email}`);
});

(async function () {
  try {
    await agenda.start();
    console.log('Agenda started');
  } catch (err) {
    console.error('Error starting Agenda:', err);
  }
})();

module.exports = agenda;
