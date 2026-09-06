export type CategoryId = 'text' | 'development' | 'image' | 'random';

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
}

export const categories: Record<CategoryId, string> = {
  text: 'テキスト',
  development: '開発',
  image: '画像',
  random: 'ランダム・抽選',
};
