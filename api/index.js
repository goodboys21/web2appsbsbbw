const express = require('express');
const axios = require('axios');
const app = express();

const API_KEY = 'bagus'; // Ganti kalau mau

class web2apk {
  constructor() {
    this.baseURL = 'https://standalone-app-api.appmaker.xyz';
  }

  async startBuild(url, email) {
    try {
      const res = await axios.post(`${this.baseURL}/webapp/build`, { url, email });
      return res.data?.body?.appId;
    } catch (err) {
      throw new Error('Build gagal: ' + err.message);
    }
  }

  async buildConfig(url, appID, appName) {
    try {
      const logo = 'https://cloudgood.xyz/file/l0gO3M1.png'; // Ganti URL ini dengan ikon default kamu
      const config = {
        appId: appID,
        appIcon: logo,
        appName: appName,
        isPaymentInProgress: true,
        enableShowToolBar: true,
        toolbarColor: '#03A9F4',
        toolbarTitleColor: '#FFFFFF',
        splashIcon: logo
      };
      const res = await axios.post(`${this.baseURL}/webapp/build/build`, config);
      return res.data;
    } catch (err) {
      throw new Error('Build Config gagal: ' + err.message);
    }
  }

  async getStatus(appID) {
    try {
      while (true) {
        const res = await axios.get(`${this.baseURL}/webapp/build/status?appId=${appID}`);
        if (res.data?.body?.status === 'success') {
          return true;
        }
        await this.delay(5000);
      }
    } catch (err) {
      throw new Error('Gagal cek status: ' + err.message);
    }
  }

  async getDownload(appID) {
    try {
      const res = await axios.get(`${this.baseURL}/webapp/complete/download?appId=${appID}`);
      return res.data;
    } catch (err) {
      throw new Error('Gagal mengambil link download: ' + err.message);
    }
  }

  async build(url, email, appName) {
    try {
      const appID = await this.startBuild(url, email);
      await this.buildConfig(url, appID, appName);
      await this.getStatus(appID);
      const link = await this.getDownload(appID);
      return link;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async delay(ms) {
    return new Promise(res => setTimeout(res, ms));
  }
}

app.get('/tools/web2app', async (req, res) => {
  const { apikey, url, email, name } = req.query;

  if (apikey !== API_KEY) {
    return res.status(403).json({
      status: false,
      creator: 'Bagus Bahril',
      message: 'API key tidak valid.'
    });
  }

  if (!url || !email || !name) {
    return res.status(400).json({
      status: false,
      creator: 'Bagus Bahril',
      message: 'Parameter url, email, dan name wajib diisi.'
    });
  }

  const builder = new web2apk();
  try {
    const link = await builder.build(url, email, name);
    res.json({
      status: true,
      creator: 'Bagus Bahril',
      download_link: link
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      creator: 'Bagus Bahril',
      message: err.message
    });
  }
});

module.exports = app;
