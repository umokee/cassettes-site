const Client = require('../../models/Client')
const Rental = require('../../models/Rental')
const ActivityLogger = require('../../shared/activityLogger')

class ClientsService {
  async getClients({ page, limit, search, sortBy = 'createdAt', sortOrder = 'desc' }) {
    const skip = (page - 1) * limit

    const query = {}
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    const sort = {}
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1
    
    const [clients, total] = await Promise.all([
      Client.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Client.countDocuments(query)
    ])
    
    return {
      clients,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    }
  }
  
  async getClientById(id) {
    const client = await Client.findById(id)
    
    if (!client) {
      throw new Error('Клиент не найден')
    }

    const rentals = await Rental.find({ client: id })
      .populate({
        path: 'cassette',
        populate: { path: 'movie', select: 'title year' }
      })
      .populate('tariff', 'name basePricePerDay')
      .sort({ rentalDate: -1 })
    
    return {
      ...client.toObject(),
      rentals
    }
  }
  
  async createClient(data, employeeId, ip = 'unknown', userAgent = 'unknown') {
    const { fullName, phone, email, status, notes } = data

    if (!fullName || !phone) {
      throw new Error('Укажите ФИО и телефон')
    }

    const existingClient = await Client.findOne({ phone })
    if (existingClient) {
      throw new Error('Клиент с таким телефоном уже существует')
    }

    const client = new Client({
      fullName,
      phone,
      email,
      status: status || 'active',
      notes
    })

    const savedClient = await client.save()

    try {
      await ActivityLogger.clientCreate(employeeId, savedClient._id, savedClient.fullName, ip, userAgent);
    } catch (logError) {
      console.error('Ошибка логирования создания клиента:', logError.message);
    }

    return savedClient
  }
  
  async updateClient(id, data, employeeId, ip = 'unknown', userAgent = 'unknown') {
    const allowedUpdates = ['fullName', 'phone', 'email', 'status', 'notes']

    const updates = {}
    Object.keys(data).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = data[key]
      }
    })

    const client = await Client.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )

    if (!client) {
      throw new Error('Клиент не найден')
    }

    try {
      await ActivityLogger.clientUpdate(employeeId, client._id, client.fullName, ip, userAgent);
    } catch (logError) {
      console.error('Ошибка логирования обновления клиента:', logError.message);
    }

    return client
  }

  async deleteClient(id, employeeId, ip = 'unknown', userAgent = 'unknown') {
    const activeRentals = await Rental.countDocuments({
      client: id,
      status: { $in: ['active', 'overdue'] }
    })

    if (activeRentals > 0) {
      throw new Error('Нельзя удалить клиента с активными арендами')
    }

    const client = await Client.findByIdAndDelete(id)

    if (!client) {
      throw new Error('Клиент не найден')
    }

    try {
      await ActivityLogger.clientDelete(employeeId, client._id, client.fullName, ip, userAgent);
    } catch (logError) {
      console.error('Ошибка логирования удаления клиента:', logError.message);
    }

    return client
  }
}

module.exports = new ClientsService()

