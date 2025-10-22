/**
 * Music API SDK 测试文件
 */

const { MusicAPI } = require('./index');

async function testSDK() {
  const musicAPI = new MusicAPI();
  
  console.log('=== Music API SDK 测试 ===\n');
  
  // 测试QQ音乐搜索
  console.log('1. 测试QQ音乐搜索:');
  try {
    const qqResult = await musicAPI.searchQQ('周杰伦', 2);
    console.log('QQ音乐搜索结果:', JSON.stringify(qqResult, null, 2));
  } catch (error) {
    console.error('QQ音乐搜索失败:', error.message);
  }
  
  console.log('\n2. 测试QQ音乐快速搜索:');
  try {
    const quickResult = await musicAPI.quickSearchQQ('周杰伦', 2);
    console.log('QQ音乐快速搜索结果:', JSON.stringify(quickResult, null, 2));
  } catch (error) {
    console.error('QQ音乐快速搜索失败:', error.message);
  }
  
  console.log('\n3. 测试网易云音乐搜索:');
  try {
    const neteaseResult = await musicAPI.searchNetease('周杰伦', 2);
    console.log('网易云音乐搜索结果:', JSON.stringify(neteaseResult, null, 2));
  } catch (error) {
    console.error('网易云音乐搜索失败:', error.message);
  }
  
  console.log('\n4. 测试QQ音乐歌词:');
  try {
    const qqLyric = await musicAPI.getQQlyric('001JDzPT1MgGy9');
    console.log('QQ音乐歌词结果:', typeof qqLyric === 'string' ? qqLyric.substring(0, 100) + '...' : JSON.stringify(qqLyric, null, 2));
  } catch (error) {
    console.error('QQ音乐歌词获取失败:', error.message);
  }
  
  console.log('\n5. 测试网易云音乐歌词:');
  try {
    const neteaseLyric = await musicAPI.getNeteaselyric('186016');
    console.log('网易云音乐歌词结果:', JSON.stringify(neteaseLyric, null, 2));
  } catch (error) {
    console.error('网易云音乐歌词获取失败:', error.message);
  }
  
  console.log('\n=== 测试完成 ===');
}

// 运行测试
testSDK().catch(console.error);