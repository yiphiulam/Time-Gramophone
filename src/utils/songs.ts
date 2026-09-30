export interface Song {
  id: string;
  title: string;
  artist: string;
  year: string;
  bpm: number;
  notes: number[]; // Frequencies or MIDI notes
  youtubeId?: string; // YouTube video ID for background music
  youtubeStart?: number; // Optional exact seconds to start the track
}

export const SONGS: Song[] = [
  {
    id: 'moon',
    title: '月亮代表我的心',
    artist: '鄧麗君',
    year: '1977',
    bpm: 84,
    youtubeId: 'FhIXtvJbr3o',
    youtubeStart: 53, // 10s intro, 40s chorus, 10s fade = 60s total
    // Melody notes (frequencies in Hz)
    notes: [
      261.63, 329.63, 392.00, 523.25, 493.88, 440.00, 392.00, // 你問我愛你有多深
      329.63, 392.00, 440.00, 440.00, 392.00, 329.63, 293.66, // 我愛你有幾分
      261.63, 293.66, 329.63, 329.63, 261.63, 220.00, 261.63, // 我的情也真
      293.66, 329.63, 293.66, 293.66, 261.63, 220.00, 261.63 // 我的愛也真
    ]
  },
  {
    id: 'tianmimi',
    title: '甜蜜蜜',
    artist: '鄧麗君',
    year: '1979',
    bpm: 104,
    youtubeId: '9iRlk5uXhZQ',
    youtubeStart: 45, // 10s intro before chorus, then 40s chorus, then 10s fade = 60s total
    notes: [
      329.63, 392.00, 440.00, 392.00, 329.63, 293.66, 261.63, 293.66, // 甜蜜蜜你笑得甜蜜蜜
      329.63, 392.00, 440.00, 392.00, 329.63, 293.66, // 好像花兒開在春風裡
      261.63, 293.66, 329.63, 261.63, 293.66, 329.63, 392.00, // 開在春風裡
      440.00, 523.25, 440.00, 392.00, 440.00, 392.00, 329.63, 293.66 // 在哪裡在哪裡見過你
    ]
  },
  {
    id: 'aipincaihuiying',
    title: '愛拼才會贏',
    artist: '葉啟田',
    year: '1988',
    bpm: 120,
    youtubeId: 'buCkOl5hV_o',
    youtubeStart: 46, // 10s intro before chorus, then 40s chorus, then 10s fade = 60s total
    notes: [
      329.63, 392.00, 440.00, 523.25, 440.00, 392.00, 329.63, // 一時失志毋免怨嘆
      392.00, 329.63, 293.66, 261.63, 293.66, 329.63, 392.00, // 一時落魄毋免膽寒
      440.00, 523.25, 440.00, 392.00, 329.63, 293.66, 261.63, // 那通失去希望每日醉茫茫
      261.63, 293.66, 329.63, 392.00, 440.00, 392.00, 523.25  // 無魂有體親像稻草人
    ]
  }
];
