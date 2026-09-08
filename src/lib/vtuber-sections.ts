export const vtuberSections = {
  preparation: { name: '配信準備', path: '/vtuber/preparation/', description: 'タイトル、告知、概要欄、企画、役割分担を準備するツールです。', tools: ['stream-title-generator','stream-announcement-generator','stream-description-generator','stream-idea-generator','talk-topic-generator','collab-role-maker'] },
  live: { name: '配信中・アーカイブ', path: '/vtuber/live/', description: 'OBS表示、抽選、目標管理、時間計算、チャプター作成に使うツールです。', tools: ['obs-countdown','obs-text-decorator','comment-lottery','stream-goal-counter','stream-time-calculator','youtube-chapter-formatter'] },
  materials: { name: '画像・配信素材', path: '/vtuber/materials/', description: 'スケジュール画像やYouTubeサムネイルなど、配信素材を作るツールです。', tools: ['stream-schedule-maker','youtube-thumbnail-resizer','hashtag-formatter','name-checker'] }
} as const;
export type VtuberSectionId = keyof typeof vtuberSections;
