const axios = require('axios');
const CryptoJS = require('crypto-js');
const forge = require('node-forge');

class NeteaseService {
  constructor() {
    this.baseURL = 'https://music.163.com';
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    
    // 加密相关常量
    this.iv = '0102030405060708';
    this.presetKey = '0CoJUm6Qyw8W8jud';
    this.base62 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    this.publicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDgtQn2JZ34ZC28NWYpAUd98iZ37BUrX/aKzmFbt7clFSs6sXqHauqKWqdtLkF2KexO40H1YTX8z2lSgBBOAxLsvaklV8k4cBFK9snQXE9/DDaFt6Rr7iVZMldczhC0JNgTz+SHXT6CBHuX3e9SdB1Ua44oncaTWz7OBGLbCiK45wIDAQAB
-----END PUBLIC KEY-----`;
    
    // Cookie管理
    this.cookies = {
      'appver': '8.20.20.231215173437',
      'versioncode': '140',
      'buildver': Date.now().toString().substr(0, 10),
      'resolution': '1920x1080',
      'os': 'pc',
      'osver': 'Microsoft-Windows-10-Professional-build-22631-64bit',
      'deviceId': this.generateDeviceId(),
      'channel': 'netease'
    };
  }

  // 生成设备ID
  generateDeviceId() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // 生成Cookie字符串
  generateCookieString() {
    return Object.keys(this.cookies)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(this.cookies[key])}`)
      .join('; ');
  }

  // AES加密
  aesEncrypt(text, key, iv) {
    const encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(text),
      CryptoJS.enc.Utf8.parse(key),
      {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    return encrypted.toString();
  }

  // 生成随机字符串
  createSecretKey(size) {
    let keys = '';
    for (let i = 0; i < size; i++) {
      keys += this.base62.charAt(Math.floor(Math.random() * this.base62.length));
    }
    return keys;
  }

  // RSA加密
  rsaEncrypt(text, pubKey) {
    const forgePublicKey = forge.pki.publicKeyFromPem(pubKey);
    const encrypted = forgePublicKey.encrypt(text, 'NONE');
    return forge.util.bytesToHex(encrypted);
  }

  // weapi加密
  weapi(object) {
    const text = JSON.stringify(object);
    const secretKey = this.createSecretKey(16);
    
    const params = this.aesEncrypt(
      this.aesEncrypt(text, this.presetKey, this.iv),
      secretKey,
      this.iv
    );
    
    const encSecKey = this.rsaEncrypt(secretKey.split('').reverse().join(''), this.publicKey);
    
    return {
      params,
      encSecKey
    };
  }

  // 创建请求选项
  createRequestOptions(data) {
    const encrypted = this.weapi(data);
    
    return {
      method: 'POST',
      url: '',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://music.163.com/',
        'Accept': '*/*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'X-Requested-With': 'XMLHttpRequest',
        'Cookie': this.generateCookieString()
      },
      data: new URLSearchParams(encrypted).toString(),
      timeout: 10000,
    };
  }

  // 基础搜索
  async search(keywords, type = 1, limit = 30, offset = 0) {
    try {
      const data = {
        s: keywords,
        type: type, // 1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频
        limit: limit,
        offset: offset,
        csrf_token: '' // 添加csrf_token参数
      };

      const options = this.createRequestOptions(data);
      options.url = `${this.baseURL}/weapi/search/get`;

      const response = await axios(options);
      console.log('搜索响应:', response);
      return response.data;
    } catch (error) {
      console.error('搜索失败:', error.message);
      throw new Error(`搜索失败: ${error.message}`);
    }
  }

  // 云搜索（推荐使用，结果更准确）
  async cloudSearch(keywords, type = 1, limit = 10, offset = 0) {
    try {
      const data = {
        s: keywords,
        type: type,
        limit: limit,
        offset: offset,
        total: true,
        csrf_token: '' // 添加csrf_token参数
      };

      const options = this.createRequestOptions(data);
      options.url = `${this.baseURL}/weapi/cloudsearch/pc`;
      console.log('云搜索请求:', options);
      
      const response = await axios(options);
      console.log('云搜索响应:', response);
      return response.data;
    } catch (error) {
      console.error('云搜索失败:', error.message);
      throw new Error(`云搜索失败: ${error.message}`);
    }
  }

  // 搜索建议
  async searchSuggest(keywords, type = 'web') {
    try {
      const data = {
        s: keywords || '',
      };

      const options = this.createRequestOptions(data);
      const endpoint = type === 'mobile' ? 'keyword' : 'web';
      options.url = `${this.baseURL}/api/search/suggest/${endpoint}`;

      const response = await axios(options);
      return response.data;
    } catch (error) {
      console.error('搜索建议失败:', error.message);
      throw new Error(`搜索建议失败: ${error.message}`);
    }
  }

  // 热门搜索
  async getHotSearch() {
    try {
      const data = {
        type: 1111,
      };

      const options = this.createRequestOptions(data);
      options.url = `${this.baseURL}/api/search/hot`;

      const response = await axios(options);
      return response.data;
    } catch (error) {
      console.error('获取热门搜索失败:', error.message);
      throw new Error(`获取热门搜索失败: ${error.message}`);
    }
  }

  // 搜索类型常量
  static get SEARCH_TYPES() {
    return {
      SONG: 1,        // 单曲
      ALBUM: 10,      // 专辑
      ARTIST: 100,    // 歌手
      PLAYLIST: 1000, // 歌单
      USER: 1002,     // 用户
      MV: 1004,       // MV
      LYRIC: 1006,    // 歌词
      RADIO: 1009,    // 电台
      VIDEO: 1014,    // 视频
    };
  }

  // 便捷搜索方法
  async searchSongs(keywords, limit = 30, offset = 0) {
    return this.cloudSearch(keywords, NeteaseService.SEARCH_TYPES.SONG, limit, offset);
  }

  async searchAlbums(keywords, limit = 30, offset = 0) {
    return this.cloudSearch(keywords, NeteaseService.SEARCH_TYPES.ALBUM, limit, offset);
  }

  async searchArtists(keywords, limit = 30, offset = 0) {
    return this.cloudSearch(keywords, NeteaseService.SEARCH_TYPES.ARTIST, limit, offset);
  }

  async searchPlaylists(keywords, limit = 30, offset = 0) {
    return this.cloudSearch(keywords, NeteaseService.SEARCH_TYPES.PLAYLIST, limit, offset);
  }

  // 获取歌词
  async lyric(id) {
    try {
      // 使用NeteaseCloudMusicApiBackup的lyric模块
      const lyricModule = require('../../NeteaseCloudMusicApiBackup/module/lyric.js');
      const request = require('../../NeteaseCloudMusicApiBackup/util/request.js');
      
      const result = await lyricModule({ id }, request);
      
      if (result.body && result.body.code === 200) {
        return {
          code: "200",
          data: {
            lyric: result.body.lrc ? result.body.lrc.lyric : '',
            tlyric: result.body.tlyric ? result.body.tlyric.lyric : '',
            romalrc: result.body.romalrc ? result.body.romalrc.lyric : ''
          }
        };
      } else {
        return { 
          code: "404",
          data: {
            lyric: "",
            error: '未找到歌词'
          }
        };
      }
    } catch (error) {
      console.error('获取歌词失败:', error);
      return { 
        code: "500",
        data: {
          lyric: "",
          error: '获取歌词失败'
        }
      };
    }
  }
}

module.exports = NeteaseService;