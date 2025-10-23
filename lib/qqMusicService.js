const crypto = require('crypto');
const axios = require('axios');
const zlib = require('zlib');

/**
 * QQ音乐服务类
 * 提供搜索和歌词获取功能
 */
class QQMusicService {
  constructor() {
    this.baseUrl = 'https://u.y.qq.com';
    this.apiEndpoint = 'https://u.y.qq.com/cgi-bin/musicu.fcg';
    this.encEndpoint = 'https://u.y.qq.com/cgi-bin/musics.fcg';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Edg/116.0.1938.54',
      'Referer': 'https://y.qq.com/',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Content-Type': 'application/json',
      'Origin': 'https://y.qq.com',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site'
    };
  }

  /**
   * 计算MD5哈希
   */
  calcMd5(data) {
    return crypto.createHash('md5').update(data).digest('hex');
  }

  /**
   * 生成随机GUID
   */
  getGuid() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  /**
   * 生成随机searchID
   */
  getSearchID() {
    return Math.floor(Math.random() * 2147483647) + 1;
  }

  /**
   * QQ音乐签名算法
   */
  sign(data) {
    const str = JSON.stringify(data);
    const hash = crypto.createHash('sha1').update(str).digest();
    
    // 简化的签名算法，实际QQ音乐的签名更复杂
    const indices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    let result = '';
    
    for (let i = 0; i < indices.length; i++) {
      const index = indices[i];
      if (index < hash.length) {
        result += hash[index].toString(16).padStart(2, '0');
      }
    }
    
    return Buffer.from(result, 'hex').toString('base64');
  }

  /**
   * QRC歌词解密（简化版本）
   */
  qrcDecrypt(data) {
    try {
      // 简化的解密逻辑，实际QQ音乐使用3DES + zlib
      if (typeof data === 'string') {
        // 如果是base64编码的数据，先解码
        try {
          const decoded = Buffer.from(data, 'base64');
          return zlib.inflateSync(decoded).toString('utf-8');
        } catch (e) {
          return data; // 如果解码失败，返回原始数据
        }
      }
      return data;
    } catch (error) {
      console.error('QRC解密失败:', error);
      return '';
    }
  }

  /**
   * 构建请求数据
   */
  buildRequestData(module, method, param = {}) {
    // 生成一个更真实的QIMEI36值
    const qimei36 = this.generateQIMEI36();
    
    return {
      comm: {
        ct: '11',
        cv: 13020508,
        v: 13020508,
        tmeAppID: 'qqmusic',
        QIMEI36: qimei36,
        uid: '3931641530',
        format: 'json',
        inCharset: 'utf-8',
        outCharset: 'utf-8'
      },
      [`${module}.${method}`]: {
        module: module,
        method: method,
        param: param
      }
    };
  }

  /**
   * 生成QIMEI36标识符
   */
  generateQIMEI36() {
    // 生成一个类似真实QIMEI36的标识符
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 发送API请求
   */
  async apiRequest(url, data) {
    try {
      const response = await axios.post(url, data, {
        headers: this.headers,
        timeout: 30000, // 增加超时时间到30秒
        validateStatus: function (status) {
          return status >= 200 && status < 300; // 只接受2xx状态码
        }
      });
      
      // 检查响应数据
      if (response.data && response.data.code !== undefined && response.data.code !== 0) {
        throw new Error(`API返回错误: ${response.data.code} - ${response.data.msg || '未知错误'}`);
      }
      
      return response.data;
    } catch (error) {
      console.error('API请求失败:', error.message);
      if (error.code === 'ECONNRESET') {
        throw new Error(`网络连接被重置，请检查网络连接`);
      } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
        throw new Error(`请求超时，请稍后重试`);
      }
      throw new Error(`请求失败: ${error.message}`);
    }
  }

  /**
   * 歌曲搜索
   */
  async searchSongs(keywords, limit = 30, offset = 0) {
    const param = {
      query: keywords,
      page_no: Math.floor(offset / limit) + 1,
      num_per_page: limit,
      search_type: 0
    };

    const data = this.buildRequestData('music.search.SearchCgiService', 'DoSearchForQQMusicDesktop', param);
    const url = this.apiEndpoint;
    
    const result = await this.apiRequest(url, data);
    
    // 修复响应数据访问路径
    if (result && result['music.search.SearchCgiService.DoSearchForQQMusicDesktop']) {
      return result['music.search.SearchCgiService.DoSearchForQQMusicDesktop'];
    }
    
    return result;
  }

  /**
   * 综合搜索
   */
  async generalSearch(keywords, limit = 30, offset = 0) {
    const param = {
      query: keywords,
      page_no: Math.floor(offset / limit) + 1,
      num_per_page: limit,
      search_type: 0,
      nqc_flag: 0,
      page_id: 1,
      search_id: this.getSearchID()
    };

    const data = this.buildRequestData('music.search.SearchCgiService', 'DoSearchForQQMusicDesktop', param);
    const url = this.apiEndpoint;
    
    const result = await this.apiRequest(url, data);
    
    // 修复响应数据访问路径
    if (result && result['music.search.SearchCgiService.DoSearchForQQMusicDesktop']) {
      return result['music.search.SearchCgiService.DoSearchForQQMusicDesktop'];
    }
    
    return result;
  }

  /**
   * 快速搜索
   */
  async quickSearch(keywords, limit = 10) {
    const param = {
      query: keywords,
      page_no: 1,
      num_per_page: limit,
      search_type: 0
    };

    const data = this.buildRequestData('music.search.SearchCgiService', 'DoSearchForQQMusicDesktop', param);
    const url = this.apiEndpoint;
    
    const result = await this.apiRequest(url, data);
    
    // 修复响应数据访问路径
    if (result && result['music.search.SearchCgiService.DoSearchForQQMusicDesktop']) {
      return result['music.search.SearchCgiService.DoSearchForQQMusicDesktop'];
    }
    
    return result;
  }

  /**
   * 按类型搜索
   */
  async searchByType(keywords, type = 'song', limit = 30, offset = 0) {
    const typeMap = {
      'song': 0,
      'album': 8,
      'singer': 9,
      'mv': 12,
      'playlist': 3,
      'user': 7,
      'lyric': 7
    };

    const searchType = typeMap[type] || 0;
    
    const param = {
      query: keywords,
      page_no: Math.floor(offset / limit) + 1,
      num_per_page: limit,
      search_type: searchType
    };

    const data = this.buildRequestData('music.search.SearchCgiService', 'DoSearchForQQMusicDesktop', param);
    const url = this.apiEndpoint;
    
    const result = await this.apiRequest(url, data);
    
    // 修复响应数据访问路径
    if (result && result['music.search.SearchCgiService.DoSearchForQQMusicDesktop']) {
      return result['music.search.SearchCgiService.DoSearchForQQMusicDesktop'];
    }
    
    return result;
  }

  /**
   * 获取歌词
   */
  async getLyric(songmid, qrc = false, trans = false, roma = false) {
    try {
      const param = {
        songmid: songmid,
        pcachetime: Date.now(),
        qrc: qrc ? 1 : 0,
        trans: trans ? 1 : 0,
        roma: roma ? 1 : 0,
        type: 1,
        json: 1
      };

      const data = this.buildRequestData('music.musichallSong.PlayLyricInfo', 'GetPlayLyricInfo', param);
      const url = this.apiEndpoint;

      const result = await this.apiRequest(url, data);
      
      if (result && result['music.musichallSong.PlayLyricInfo.GetPlayLyricInfo'] && result['music.musichallSong.PlayLyricInfo.GetPlayLyricInfo'].data) {
        const lyricData = result['music.musichallSong.PlayLyricInfo.GetPlayLyricInfo'].data;
        const response = {
          lyric: '',
          trans: '',
          roma: ''
        };

        // 处理普通歌词
        if (lyricData.lyric) {
          try {
            response.lyric = Buffer.from(lyricData.lyric, 'base64').toString('utf-8');
          } catch (e) {
            response.lyric = lyricData.lyric;
          }
        }

        // 处理翻译歌词
        if (lyricData.trans) {
          try {
            response.trans = Buffer.from(lyricData.trans, 'base64').toString('utf-8');
          } catch (e) {
            response.trans = lyricData.trans;
          }
        }

        // 处理罗马音歌词
        if (lyricData.roma) {
          try {
            response.roma = Buffer.from(lyricData.roma, 'base64').toString('utf-8');
          } catch (e) {
            response.roma = lyricData.roma;
          }
        }

        // 处理QRC歌词
        if (qrc && lyricData.qrc) {
          response.qrc = this.qrcDecrypt(lyricData.qrc);
        }

        return {
          code: 200,
          data: response
        };
      }

      return {
        code: 404,
        data: {
          lyric: '',
          trans: '',
          roma: '',
          error: '未找到歌词'
        }
      };
    } catch (error) {
      console.error('获取歌词失败:', error);
      return {
        code: 500,
        data: {
          lyric: '',
          trans: '',
          roma: '',
          error: error.message
        }
      };
    }
  }

  /**
   * 获取热搜词
   */
  async getHotkey() {
    try {
      const param = {
        search_id: this.getSearchID()
      };

      const data = this.buildRequestData('music.musicsearch.HotkeyService', 'GetHotkeyForQQMusicMobile', param);
      const url = this.apiEndpoint;

      const result = await this.apiRequest(url, data);
      
      // 修复响应数据访问路径
      if (result && result['music.musicsearch.HotkeyService.GetHotkeyForQQMusicMobile']) {
        return result['music.musicsearch.HotkeyService.GetHotkeyForQQMusicMobile'];
      }
      
      return result;
    } catch (error) {
      console.error('获取热搜词失败:', error);
      throw new Error(`获取热搜词失败: ${error.message}`);
    }
  }

  /**
   * 获取搜索补全
   */
  async getComplete(keywords) {
    try {
      const param = {
        query: keywords,
        search_id: this.getSearchID()
      };

      const data = this.buildRequestData('music.smartboxCgi.SmartBoxCgi', 'GetSmartBoxResult', param);
      const url = this.apiEndpoint;

      const result = await this.apiRequest(url, data);
      
      // 修复响应数据访问路径
      if (result && result['music.smartboxCgi.SmartBoxCgi.GetSmartBoxResult']) {
        return result['music.smartboxCgi.SmartBoxCgi.GetSmartBoxResult'];
      }
      
      return result;
    } catch (error) {
      console.error('获取搜索补全失败:', error);
      throw new Error(`获取搜索补全失败: ${error.message}`);
    }
  }
}

module.exports = QQMusicService;