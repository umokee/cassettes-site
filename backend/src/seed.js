require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const Genre = require('./models/Genre');
const Tariff = require('./models/Tariff');
const Client = require('./models/Client');
const Movie = require('./models/Movie');
const Cassette = require('./models/Cassette');
const Rental = require('./models/Rental');
const connectDB = require('./config/database');

const seedData = async () => {
 try {
 await connectDB();

 await Employee.deleteMany({});
 await Genre.deleteMany({});
 await Tariff.deleteMany({});
 await Client.deleteMany({});
 await Movie.deleteMany({});
 await Cassette.deleteMany({});
 await Rental.deleteMany({});

 console.log(' База данных очищена');

 const now = new Date();

 const employees = [];
 const admin = await Employee.create({
 fullName: 'Администратор Главный',
 login: 'admin',
 password: '123456',
 email: 'admin@example.com',
 phone: '+79001000000',
 role: 'admin',
 bio: 'Главный администратор видеопроката',
 hireDate: new Date('2020-01-01'),
 isActive: true
 });
 employees.push(admin);

 const adminCount = 3;
 for (let i = 0; i < adminCount; i++) {
 const emp = await Employee.create({
 fullName: `Администратор ${i + 1}`,
 login: `admin${i + 1}`,
 password: '123456',
 email: `admin${i + 1}@example.com`,
 phone: `+7900100000${i + 1}`,
 role: 'admin',
 bio: `Опытный администратор с ${2 + i} годами стажа`,
 hireDate: new Date(2021, i, 1),
 isActive: true
 });
 employees.push(emp);
 }

 const cashierCount = 8;
 for (let i = 0; i < cashierCount; i++) {
 const emp = await Employee.create({
 fullName: `Кассир ${i + 1}`,
 login: `cashier${i + 1}`,
 password: '123456',
 email: `cashier${i + 1}@example.com`,
 phone: `+7900100001${i + 1}`,
 role: 'cashier',
 bio: `Приветливый кассир, обслуживает клиентов`,
 hireDate: new Date(2022, i % 12, 1),
 isActive: i < 7
 });
 employees.push(emp);
 }

 console.log(` Создано ${employees.length} сотрудников`);

 const genreNames = [
 'Боевик', 'Комедия', 'Драма', 'Фантастика', 'Ужасы',
 'Триллер', 'Мелодрама', 'Детектив', 'Приключения', 'Фэнтези',
 'Вестерн', 'Военный', 'Исторический', 'Криминал', 'Анимация'
 ];
 const genres = [];
 for (let i = 0; i < genreNames.length; i++) {
 const genre = await Genre.create({
 name: genreNames[i],
 description: `Фильмы в жанре ${genreNames[i].toLowerCase()}`,
 isActive: true
 });
 genres.push(genre);
 }

 console.log(` Создано ${genres.length} жанров`);

 const tariffs = [];
 const tariffData = [
 {
 name: 'Стандарт',
 base: 100,
 multi: 2,
 def: true,
 desc: 'Базовый тариф для кратковременной аренды',
 discounts: [
 { minDays: 7, discount: 10 },
 { minDays: 14, discount: 20 }
 ]
 },
 {
 name: 'Премиум',
 base: 150,
 multi: 1.5,
 def: false,
 desc: 'Премиальный тариф с минимальным штрафом за просрочку',
 discounts: [
 { minDays: 5, discount: 15 },
 { minDays: 10, discount: 25 }
 ]
 },
 {
 name: 'Эконом',
 base: 75,
 multi: 2.5,
 def: false,
 desc: 'Экономичный тариф с повышенным штрафом',
 discounts: [
 { minDays: 10, discount: 15 }
 ]
 },
 {
 name: 'VIP',
 base: 200,
 multi: 1.2,
 def: false,
 desc: 'VIP тариф для постоянных клиентов',
 discounts: [
 { minDays: 3, discount: 10 },
 { minDays: 7, discount: 20 },
 { minDays: 14, discount: 30 }
 ]
 },
 {
 name: 'Выходной день',
 base: 120,
 multi: 2,
 def: false,
 desc: 'Специальный тариф для аренды на выходные',
 discounts: []
 }
 ];

 for (let i = 0; i < tariffData.length; i++) {
 const t = tariffData[i];
 const tariff = await Tariff.create({
 name: t.name,
 description: t.desc,
 basePricePerDay: t.base,
 overdueMultiplier: t.multi,
 durationDiscounts: t.discounts,
 isDefault: t.def,
 isActive: true
 });
 tariffs.push(tariff);
 }

 console.log(` Создано ${tariffs.length} тарифов`);

 const clients = [];
 const firstNames = ['Александр', 'Дмитрий', 'Иван', 'Сергей', 'Андрей', 'Алексей', 'Михаил', 'Владимир', 'Николай', 'Евгений'];
 const lastNames = ['Иванов', 'Петров', 'Сидоров', 'Козлов', 'Васильев', 'Смирнов', 'Федоров', 'Михайлов', 'Соколов', 'Морозов'];

 for (let i = 0; i < 60; i++) {
 const client = await Client.create({
 fullName: `${lastNames[i % lastNames.length]} ${firstNames[i % firstNames.length]} ${String.fromCharCode(65 + (i % 26))}.`,
 phone: `+79${String(101000000 + i * 123).slice(0, 9)}`,
 email: `client${i + 1}@mail.ru`,
 address: `г. Москва, ул. ${['Ленина', 'Пушкина', 'Гагарина', 'Победы', 'Мира'][i % 5]}, д. ${1 + (i % 50)}`,
 dateOfBirth: new Date(1970 + (i % 40), i % 12, (i % 28) + 1),
 passportNumber: `${4500 + i} ${100000 + i * 1000}`,
 registrationDate: new Date(2020 + (i % 5), (i * 2) % 12, (i % 28) + 1),
 status: i > 55 ? 'blocked' : 'active'
 });
 clients.push(client);
 }

 console.log(` Создано ${clients.length} клиентов`);

 const movieTitles = [
 'Матрица', 'Криминальное чтиво', 'Форрест Гамп', 'Начало', 'Бойцовский клуб',
 'Крестный отец', 'Побег из Шоушенка', 'Темный рыцарь', 'Список Шиндлера', 'Властелин колец',
 'Криминальное чтиво', 'Интерстеллар', 'Гладиатор', 'Семь', 'Молчание ягнят',
 'Спасти рядового Райана', 'Зеленая миля', 'Престиж', 'Леон', 'Унесенные призраками'
 ];

 const directors = [
 'Вачовски', 'Тарантино', 'Земекис', 'Нолан', 'Финчер',
 'Коппола', 'Дарабонт', 'Спилберг', 'Джексон', 'Скорсезе'
 ];

 const movies = [];
 for (let i = 0; i < 60; i++) {
 const genreCount = Math.min(3, 1 + (i % 3));
 const movieGenres = [];
 for (let j = 0; j < genreCount; j++) {
 movieGenres.push(genres[(i + j) % genres.length]._id);
 }

 const titleIndex = i % movieTitles.length;
 const movieRatings = ['G', 'PG', 'PG-13', 'R', 'NC-17', 'Не указан'];
 const movie = await Movie.create({
 title: i < movieTitles.length ? movieTitles[titleIndex] : `Фильм ${i + 1}`,
 director: directors[i % directors.length],
 year: 1990 + (i % 34),
 duration: 90 + (i % 90),
 rating: movieRatings[i % movieRatings.length],
 description: `Увлекательный ${genreNames[(i % genreNames.length)].toLowerCase()} фильм ${i + 1} от режиссера ${directors[i % directors.length]}`,
 genres: movieGenres,
 isActive: i < 58
 });
 movies.push(movie);
 }

 console.log(` Создано ${movies.length} фильмов`);

 const cassettes = [];
 const formats = ['VHS', 'Betamax', 'Video8', 'Hi8'];
 const conditions = ['excellent', 'good', 'fair', 'poor'];
 let serialCounter = 1000;

 for (const movie of movies) {
 const cassetteCount = 2 + (movies.indexOf(movie) % 4);
 for (let i = 0; i < cassetteCount; i++) {
 const cassette = await Cassette.create({
 movie: movie._id,
 serialNumber: `VHS-${String(serialCounter++).padStart(6, '0')}`,
 format: formats[i % formats.length],
 purchaseDate: new Date(2015 + (i % 10), (i * 3) % 12, (i % 28) + 1),
 purchasePrice: 500 + (i * 100),
 condition: conditions[i % conditions.length],
 status: 'available',
 notes: i % 3 === 0 ? `Заметка: кассета в ${conditions[i % conditions.length]} состоянии` : ''
 });
 cassettes.push(cassette);
 }
 }

 console.log(` Создано ${cassettes.length} кассет`);

 const rentals = [];
 let rentalCounter = 0;

 const createRental = async (scenario) => {
 const client = clients[rentalCounter % clients.length];
 const cassette = cassettes[rentalCounter % cassettes.length];
 const employee = employees[rentalCounter % employees.length];
 const tariff = tariffs[rentalCounter % tariffs.length];

 const rentalDate = new Date(now);
 rentalDate.setDate(rentalDate.getDate() + scenario.rentalDaysOffset);

 const plannedReturnDate = new Date(rentalDate);
 plannedReturnDate.setDate(plannedReturnDate.getDate() + scenario.rentalDuration);

 let actualReturnDate = null;
 let status = 'active';
 

 if (scenario.returned) {
 actualReturnDate = new Date(rentalDate);
 actualReturnDate.setDate(actualReturnDate.getDate() + scenario.actualDuration);
 status = 'returned';
 } else {
 if (now > plannedReturnDate) {
 status = 'overdue';
 
 }
 }

 if (!scenario.returned) {
 cassette.status = 'rented';
 await cassette.save();
 }

 const totalCost = tariff.basePricePerDay * scenario.rentalDuration;

 const rental = await Rental.create({
 client: client._id,
 cassette: cassette._id,
 employee: employee._id,
 tariff: tariff._id,
 rentalDate: rentalDate,
 plannedReturnDate: plannedReturnDate,
 actualReturnDate: actualReturnDate,
 days: scenario.rentalDuration,
 pricePerDay: tariff.basePricePerDay,
 totalCost: totalCost,
 status: status,
 conditionBefore: cassette.condition,
 conditionAfter: scenario.returned ? cassette.condition : undefined
 });

 rentalCounter++;
 return rental;
 };

 console.log(' Создание старых возвращенных аренд...');
 for (let i = 0; i < 15; i++) {
 const rental = await createRental({
 rentalDaysOffset: -180 - (i * 10),
 rentalDuration: 3 + (i % 5),
 actualDuration: 3 + (i % 5),
 returned: true
 });
 rentals.push(rental);
 }

 console.log(' Создание недавних возвращенных аренд...');
 for (let i = 0; i < 20; i++) {
 const rental = await createRental({
 rentalDaysOffset: -1 - i,
 rentalDuration: 3 + (i % 7),
 actualDuration: 3 + (i % 7),
 returned: true
 });
 rentals.push(rental);
 }

 console.log(' Создание свежих активных аренд...');
 for (let i = 0; i < 10; i++) {
 const rental = await createRental({
 rentalDaysOffset: -i,
 rentalDuration: 7,
 returned: false
 });
 rentals.push(rental);
 }

 console.log(' Создание аренд на грани просрочки...');
 for (let i = 0; i < 8; i++) {
 const rental = await createRental({
 rentalDaysOffset: -5 - i,
 rentalDuration: 7,
 returned: false
 });
 rentals.push(rental);
 }

 console.log(' Создание аренд с малой просрочкой...');
 for (let i = 0; i < 8; i++) {
 const rental = await createRental({
 rentalDaysOffset: -7 - i,
 rentalDuration: 3,
 returned: false
 });
 rentals.push(rental);
 }

 console.log(' Создание аренд со средней просрочкой...');
 for (let i = 0; i < 6; i++) {
 const rental = await createRental({
 rentalDaysOffset: -12 - (i * 2),
 rentalDuration: 5,
 returned: false
 });
 rentals.push(rental);
 }

 console.log(' Создание аренд с большой просрочкой...');
 for (let i = 0; i < 5; i++) {
 const rental = await createRental({
 rentalDaysOffset: -35 - (i * 7),
 rentalDuration: 3,
 returned: false
 });
 rentals.push(rental);
 }

 console.log(' Создание долгосрочных активных аренд...');
 for (let i = 0; i < 5; i++) {
 const rental = await createRental({
 rentalDaysOffset: -3 - i,
 rentalDuration: 14 + (i * 3),
 returned: false
 });
 rentals.push(rental);
 }

 console.log(` Создано ${rentals.length} аренд`);

 const overdueCount = rentals.filter(r => r.status === 'overdue').length;
 const activeCount = rentals.filter(r => r.status === 'active').length;
 const returnedCount = rentals.filter(r => r.status === 'returned').length;
 const rentedCassettesCount = cassettes.filter(c => c.status === 'rented').length;

 console.log('\n База данных заполнена разнообразными тестовыми данными!');
 console.log(` Статистика:`);
 console.log(` Сотрудники: ${employees.length} (${employees.filter(e => e.isActive).length} активных)`);
 console.log(` Жанры: ${genres.length}`);
 console.log(` Тарифы: ${tariffs.length}`);
 console.log(` Клиенты: ${clients.length} (${clients.filter(c => c.status === 'active').length} активных)`);
 console.log(` Фильмы: ${movies.length} (${movies.filter(m => m.isActive).length} активных)`);
 console.log(` Кассеты: ${cassettes.length} (${rentedCassettesCount} в аренде)`);
 console.log(` Аренды: ${rentals.length}`);
 console.log(` ├─ Возвращенные: ${returnedCount}`);
 console.log(` ├─ Активные: ${activeCount}`);
 console.log(` └─ Просроченные: ${overdueCount}`);

 console.log(`\n Распределение аренд:`);
 console.log(` Старые возвращенные (6-12 мес назад): 15`);
 console.log(` Недавние возвращенные (1-30 дн назад): 20`);
 console.log(` Свежие активные (в срок): 10`);
 console.log(` На грани просрочки: 8`);
 console.log(` Просрочка 1-3 дня: 8`);
 console.log(` Просрочка 5-10 дней: 6`);
 console.log(` Просрочка месяц+: 5`);
 console.log(` Долгосрочные активные: 5`);

 console.log(`\n Учетные данные:`);
 console.log(` Админ: admin / 123456`);
 console.log(` Кассир: cashier1 / 123456`);

 process.exit(0);
 } catch (error) {
 console.error(' Ошибка:', error);
 process.exit(1);
 }
};

seedData();
