const authService = require("./service");
const getClientInfo = require('../../../shared/getClientInfo');

class AuthController {
  async login(req, res, next) {
    try {
      const { login, password } = req.body;

      if (!login || !password) {
        return res.status(400).json({ message: "Заполните все поля" });
      }

      const { ip, userAgent } = getClientInfo(req);

      const result = await authService.login(login, password, ip, userAgent);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user._id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const employee = await authService.updateProfile(req.user._id, req.body);
      res.json(employee);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Заполните все поля" });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "Пароль должен быть минимум 6 символов" });
      }

      const result = await authService.changePassword(
        req.user._id,
        currentPassword,
        newPassword
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const { period } = req.query;
      const stats = await authService.getUserStatistics(req.user._id, period);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  async getActivityLogs(req, res, next) {
    try {
      const logs = await authService.getActivityLogs(req.user, req.query);
      res.json(logs);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      res.json({ message: "Успешный выход" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
