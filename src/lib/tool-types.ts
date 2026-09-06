export type CategoryId = 'vtuber' | 'text' | 'development' | 'image' | 'random';

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: CategoryId;
  path: string;
  enabled: boolean;
  isNew: boolean;
  uses: string[];
  faq: { q: string; a: string }[];
  keywords?: string[];
  relatedTools?: string[];
  popular?: boolean;
}

export const categories: Record<CategoryId, string> = {
  vtuber: 'VTuber・配信者向け',
  text: 'テキスト',
  development: '開発',
  image: '画像',
  random: 'ランダム・抽選',
};

export const categoryPaths: Record<CategoryId, string> = {
  vtuber: '/vtuber/',
  image: '/image/',
  text: '/text/',
  development: '/developer/',
  random: '/random/',
};
