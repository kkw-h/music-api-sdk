/**
 * Music API SDK
 * 统一的网易云音乐和QQ音乐API接口
 */

const NeteaseService = require('./lib/neteaseService');
const QQMusicService = require('./lib/qqMusicService');
const SearchFormatter = require('./utils/searchFormatter');

class MusicAPI {
  constructor() {
    this.netease = new NeteaseService();
    this.qq = new QQMusicService();
  }

  /**
   * 网易云音乐搜索
   * @param {string} keywords - 搜索关键词
   * @param {number} limit - 返回数量限制
   * @param {number} offset - 偏移量
   * @returns {Promise<Object>} 格式化后的搜索结果
   */
  async searchNetease(keywords, limit = 30, offset = 0) {
    try {
      const result = await this.netease.cloudSearch(keywords, 1, limit, offset);
      return SearchFormatter.addFormattedDuration(
        SearchFormatter.formatNeteaseResult(result)
      );
    } catch (error) {
      console.error('网易云音乐搜索失败:', error);
      return {
        code: 500,
        data: {
          songs: [],
          total: 0,
          error: error.message
        }
      };
    }
  }

  /**
   * QQ音乐搜索
   * @param {string} keywords - 搜索关键词
   * @param {number} limit - 返回数量限制
   * @param {number} offset - 偏移量
   * @returns {Promise<Object>} 格式化后的搜索结果
   */
  async searchQQ(keywords, limit = 30, offset = 0) {
    try {
      const result = await this.qq.searchSongs(keywords, limit, offset);
      return SearchFormatter.addFormattedDuration(
        SearchFormatter.formatQQMusicResult(result)
      );
    } catch (error) {
      console.error('QQ音乐搜索失败:', error);
      return {
        code: 500,
        data: {
          songs: [],
          total: 0,
          error: error.message
        }
      };
    }
  }





  /**
   * 获取网易云音乐歌词
   * @param {string} id - 歌曲ID
   * @returns {Promise<Object>} 歌词数据
   */
  async getNeteaselyric(id) {
    try {
      return await this.netease.lyric(id);
    } catch (error) {
      console.error('获取网易云音乐歌词失败:', error);
      return {
        code: 500,
        error: error.message
      };
    }
  }

  /**
   * 获取QQ音乐歌词
   * @param {string} songmid - 歌曲mid
   * @returns {Promise<Object>} 歌词数据
   */
  async getQQlyric(songmid) {
    try {
      return await this.qq.getLyric(songmid);
    } catch (error) {
      console.error('获取QQ音乐歌词失败:', error);
      return {
        code: 500,
        error: error.message
      };
    }
  }
}

// 导出类和服务
module.exports = {
  MusicAPI,
  NeteaseService,
  QQMusicService,
  SearchFormatter
};