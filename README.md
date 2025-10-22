# Music API SDK

网易云音乐和QQ音乐API接口SDK，提供统一的搜索和歌词查询功能。

## 安装

```bash
npm install music-api-sdk
```

## 使用方法

### 基本用法

```javascript
const { MusicAPI } = require('music-api-sdk');

const musicAPI = new MusicAPI();

// 网易云音乐搜索
const neteaseResult = await musicAPI.searchNetease('周杰伦', 10);

// QQ音乐搜索
const qqResult = await musicAPI.searchQQ('周杰伦', 10);

// QQ音乐快速搜索
const quickResult = await musicAPI.quickSearchQQ('周杰伦', 5);

// QQ音乐综合搜索
const generalResult = await musicAPI.generalSearchQQ('周杰伦', 10);

// 获取网易云音乐歌词
const neteaseLyric = await musicAPI.getNeteaselyric('186016');

// 获取QQ音乐歌词
const qqLyric = await musicAPI.getQQlyric('001JDzPT1MgGy9');
```

### 直接使用服务类

```javascript
const { NeteaseService, QQMusicService, SearchFormatter } = require('music-api-sdk');

const neteaseService = new NeteaseService();
const qqService = new QQMusicService();

// 使用网易云音乐服务
const result = await neteaseService.cloudSearch('周杰伦', 1, 10, 0);
const formatted = SearchFormatter.formatNeteaseResult(result);

// 使用QQ音乐服务
const qqResult = await qqService.searchSongs('周杰伦', 10, 0);
const qqFormatted = SearchFormatter.formatQQMusicResult(qqResult);
```

## API 接口

### MusicAPI 类

#### 搜索方法

- `searchNetease(keywords, limit, offset)` - 网易云音乐搜索
- `searchQQ(keywords, limit, offset)` - QQ音乐搜索
- `quickSearchQQ(keywords, limit)` - QQ音乐快速搜索
- `generalSearchQQ(keywords, limit, offset)` - QQ音乐综合搜索

#### 歌词方法

- `getNeteaselyric(id)` - 获取网易云音乐歌词
- `getQQlyric(songmid)` - 获取QQ音乐歌词

### 返回数据格式

搜索结果统一格式：

```javascript
{
  code: 200,
  data: {
    songs: [
      {
        name: "歌曲名",
        artist: "歌手名",
        album: "专辑名",
        duration: 240, // 秒
        durationFormatted: "04:00" // 格式化时长
      }
    ],
    total: 100 // 总数量
  }
}
```

## 许可证

MIT