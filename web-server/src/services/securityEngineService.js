const axios = require('axios');
require('dotenv').config();

const SECURITY_ENGINE_URL = process.env.SECURITY_ENGINE_URL || 'http://localhost:8000';

class SecurityEngineService {
  async runScan(targetUrl, scanType = 'quick') {
    try {
      const response = await axios.post(`${SECURITY_ENGINE_URL}/scan`, {
        target_url: targetUrl,
        scan_type: scanType
      });
      return response.data;
    } catch (error) {
      console.error('Error connecting to Security Engine:', error.message);
      throw new Error('No se pudo iniciar el escaneo. Verifique que el motor de seguridad esté activo.');
    }
  }

  async getStatus() {
      try {
          const response = await axios.get(`${SECURITY_ENGINE_URL}/`);
          return response.data;
      } catch (error) {
          console.error('Error checking Security Engine status:', error.message);
          return { status: 'offline' };
      }
  }
}

module.exports = new SecurityEngineService();
