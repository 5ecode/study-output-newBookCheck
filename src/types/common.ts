
export type ViewMode = 'new' | 'pending' | 'bought';

export type KeywordSet = {
  id: number,
  title: string | null,
  author: string | null,
  size: number,
}

export type State = 'ordered' | 'bought' | 'pending' | null;

export type BookData = {
  title: string;
  author: string;
  salesDate: string;
  itemUrl: string;
  imageUrl: string;
  date: string;
  isbn: string;
  state: State;
  size: 0 | 2 | 9 | 3 | 1
};

export interface BookWithId extends BookData {
  id: number;
}
