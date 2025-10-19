/**
 * 音訊數據常量
 * 用於在不同組件間共享音訊信息
 */

export interface AudioData {
  id: string;
  name: string;
  url: string;
  duration?: number;
  size?: number;
  category?: string;
}

/**
 * 音訊數據列表（模擬數據）
 * 實際項目中應該從後端 API 獲取
 */
export const AUDIO_DATA: AudioData[] = [
  {
    id: 'audio1',
    name: '小紅帽音訊',
    url: 'https://cdn.example.com/audio/little-red.mp3',
    duration: 15,
    category: '角色'
  },
  {
    id: 'audio2',
    name: '大野狼音訊',
    url: 'https://cdn.example.com/audio/wolf.mp3',
    duration: 12,
    category: '角色'
  },
  {
    id: 'audio3',
    name: '奶奶的房子音訊',
    url: 'https://cdn.example.com/audio/grandma-house.mp3',
    duration: 18,
    category: '場景'
  },
  {
    id: 'audio4',
    name: '森林背景音',
    url: 'https://cdn.example.com/audio/forest-bg.mp3',
    duration: 60,
    category: '背景音樂'
  },
  {
    id: 'audio5',
    name: '故事旁白',
    url: 'https://cdn.example.com/audio/narration.mp3',
    duration: 120,
    category: '旁白'
  },
  {
    id: 'audio6',
    name: '開場音樂',
    url: 'https://cdn.example.com/audio/opening.mp3',
    duration: 30,
    category: '背景音樂'
  },
  {
    id: 'audio7',
    name: '結尾音樂',
    url: 'https://cdn.example.com/audio/ending.mp3',
    duration: 25,
    category: '背景音樂'
  },
  {
    id: 'audio8',
    name: '角色對話1',
    url: 'https://cdn.example.com/audio/dialogue1.mp3',
    duration: 8,
    category: '對話'
  },
  {
    id: 'audio9',
    name: '角色對話2',
    url: 'https://cdn.example.com/audio/dialogue2.mp3',
    duration: 10,
    category: '對話'
  },
  {
    id: 'audio10',
    name: '角色對話3',
    url: 'https://cdn.example.com/audio/dialogue3.mp3',
    duration: 12,
    category: '對話'
  }
];

/**
 * 根據 URL 獲取音訊名稱
 * @param url 音訊 URL
 * @returns 音訊名稱，如果找不到則返回檔案名
 */
export function getAudioNameByUrl(url: string): string {
  const audio = AUDIO_DATA.find(a => a.url === url);
  
  if (audio) {
    return audio.name;
  }
  
  // 如果找不到，從 URL 中提取檔案名並格式化
  const fileName = url.split('/').pop() || '';
  return fileName.replace('.mp3', '').replace(/-/g, ' ');
}

/**
 * 根據 ID 獲取音訊數據
 * @param id 音訊 ID
 * @returns 音訊數據或 undefined
 */
export function getAudioById(id: string): AudioData | undefined {
  return AUDIO_DATA.find(a => a.id === id);
}

/**
 * 根據 URL 獲取音訊數據
 * @param url 音訊 URL
 * @returns 音訊數據或 undefined
 */
export function getAudioByUrl(url: string): AudioData | undefined {
  return AUDIO_DATA.find(a => a.url === url);
}
