/**
 * 搜索结果格式化工具
 * 统一处理网易云音乐和QQ音乐的搜索结果，只返回歌曲名、歌手、专辑名称、时长
 */

class SearchFormatter {
  /**
   * 格式化网易云音乐搜索结果
   * @param {Object} result - 网易云音乐搜索结果
   * @returns {Object} 格式化后的结果
   */
  static formatNeteaseResult(result) {
    try {
      if (!result || !result.result || !result.result.songs) {
        return {
          code: 200,
          data: {
            songs: [],
            total: 0
          }
        };
      }

      const songs = result.result.songs.map(song => ({
        id: song.id || '', // 网易云音乐歌曲ID
        name: song.name || '',
        artist: song.ar ? song.ar.map(artist => artist.name).join('/') : '',
        album: song.al ? song.al.name : '',
        duration: song.dt ? Math.floor(song.dt / 1000) : 0 // 转换为秒
      }));

      return {
        code: 200,
        data: {
          songs: songs,
          total: result.result.songCount || 0
        }
      };
    } catch (error) {
      console.error('格式化网易云音乐搜索结果失败:', error);
      return {
        code: 500,
        data: {
          songs: [],
          total: 0,
          error: '格式化搜索结果失败'
        }
      };
    }
  }

  /**
   * 格式化QQ音乐搜索结果
   * @param {Object} result - QQ音乐搜索结果
   * @returns {Object} 格式化后的结果
   */
  static formatQQMusicResult(result) {
    try {
      if (!result || !result.data || !result.data.body || !result.data.body.song || !result.data.body.song.list) {
        return {
          code: 200,
          data: {
            songs: [],
            total: 0
          }
        };
      }

      const songs = result.data.body.song.list.map(song => ({
        id: song.mid || song.songmid || '', // QQ音乐歌曲mid
        name: song.title || song.songname || '',
        artist: song.singer ? song.singer.map(s => s.name).join('/') : '',
        album: song.album ? song.album.name : '',
        duration: song.interval || 0 // QQ音乐的时长已经是秒
      }));

      return {
        code: 200,
        data: {
          songs: songs,
          total: result.data.meta ? result.data.meta.sum : songs.length
        }
      };
    } catch (error) {
      console.error('格式化QQ音乐搜索结果失败:', error);
      return {
        code: 500,
        data: {
          songs: [],
          total: 0,
          error: '格式化搜索结果失败'
        }
      };
    }
  }

  /**
   * 将时长从秒转换为 mm:ss 格式
   * @param {number} seconds - 秒数
   * @returns {string} 格式化的时长
   */
  static formatDuration(seconds) {
    if (!seconds || seconds <= 0) return '00:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * 为搜索结果添加格式化的时长显示
   * @param {Object} formattedResult - 已格式化的搜索结果
   * @returns {Object} 添加了格式化时长的结果
   */
  static addFormattedDuration(formattedResult) {
    if (formattedResult.data && formattedResult.data.songs) {
      formattedResult.data.songs = formattedResult.data.songs.map(song => ({
        ...song,
        durationFormatted: this.formatDuration(song.duration)
      }));
    }
    
    return formattedResult;
  }
}

module.exports = SearchFormatter;