import zaoqidanqu from './早期单曲.js'
import zidingyi from './自定义.js'
import xunwuqishi from './寻雾启示.js'
import sugelameiyoudi from './苏格拉没有底.js'
import mengyouji from './梦游计.js'
import buruchichaqu from './不如吃茶去.js'
import qingnianwanbao from './青年晚报.js'
import xunbaoyouxi from './寻宝游戏.js'
import huxizhiye from './呼吸之野.js'
import danqu from './单曲.js'
import anbocaixiang from './安泊猜想.js'

const albums = [
  zaoqidanqu,
  zidingyi,
  xunwuqishi,
  sugelameiyoudi,
  mengyouji,
  buruchichaqu,
  qingnianwanbao,
  xunbaoyouxi,
  huxizhiye,
  danqu,
  anbocaixiang,
]

export default albums

export function getFlatSongList() {
  const result = []
  for (const album of albums) {
    for (const song of album.songs) {
      result.push({
        ...song,
        album: album.album,
        year: song.year || (album.year !== album.album ? album.year : ''),
      })
    }
  }
  return result
}
