require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/database')

const authModule = require('./modules/auth')
const clientsModule = require('./modules/clients')
const moviesModule = require('./modules/movies')
const cassettesModule = require('./modules/cassettes')
const rentalsModule = require('./modules/rentals')
const genresModule = require('./modules/genres')
const tariffsModule = require('./modules/tariffs')
const employeesModule = require('./modules/employees')
const statsModule = require('./modules/stats')
const errorHandler = require('./shared/errorHandler')

const app = express();

app.set('trust proxy', true);
app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/auth', authModule.routes.auth)
app.use('/api/profile', authModule.routes.profile)
app.use('/api/clients', clientsModule.routes)
app.use('/api/movies', moviesModule.routes)
app.use('/api/cassettes', cassettesModule.routes)
app.use('/api/rentals', rentalsModule.routes)
app.use('/api/genres', genresModule.routes)
app.use('/api/tariffs', tariffsModule.routes)
app.use('/api/employees', employeesModule.routes)
app.use('/api/stats', statsModule.routes)

app.get('/health', (_, res) => {
  res.json({ status: 'OK', message: 'API работает' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Маршрут не найден' })
})

app.use(errorHandler)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
