// src/composables/useBookSearchApi.ts
import axios from 'axios';
import { useNewBooksStore } from '../stores/NewBooksStore';
import { updateStatefulBooks } from '../composables/useUpdateStatefulBooks';
import { parseLocalDate } from '../utils/parseLocalDate';
import { getDaysAgo } from '../utils/getDaysAgo';
import type { KeywordSet, BookData } from '../types/common';

interface RakutenApiItem {
  title: string
  author: string
  largeImageUrl: string
  itemUrl: string
  isbn: string
  salesDate: string
  size: string
}

/* 新刊情報を取得
-------------------------------------------- */
export async function useBookSearchApi(keywordSet: KeywordSet[],updateStateful = false) {
  const useNewBooks = useNewBooksStore();

  for (const item of keywordSet) {
    try {
      const baseUrl = import.meta.env.VITE_RAKUTEN_PROXY_URL;
      const res = await axios.get(baseUrl, { params: buildQueryParams(item) });
      const data = res.data;

      if (!data) return;

      const parsedData: BookData[] = data.Items.map((item: { Item: RakutenApiItem }) => ({
        title: item.Item.title,
        author: item.Item.author,
        imageUrl: item.Item.largeImageUrl,
        salesDate: item.Item.salesDate,
        itemUrl: item.Item.itemUrl,
        isbn: item.Item.isbn,
        size: mapSize(item.Item.size),
      }));

      // 新刊定義の書籍のみ取り出す
      const newBooksData: BookData[] = [];
      for (const book of parsedData) {
        const isNewBook = hasBookToAdd(book);
        if (isNewBook) {
          newBooksData.push(isNewBook);
        }
      }

      // 新刊情報をストアに追加
      useNewBooks.addNewBooks(newBooksData);

      // 状態付き書籍情報に新刊情報をマージ
      if (updateStateful) {
        updateStatefulBooks(true);
      }

      // 1秒に1回リクエスト
      await delay(1000);
    } catch (e) {
      console.error(e);
    }
  }
}

// パラメータ成型
function buildQueryParams(item: KeywordSet): URLSearchParams {
  const params = new URLSearchParams();
  params.append('format', 'json');
  params.append('sort', '-releaseDate');
  params.append('outOfStockFlag', '1');
  params.append('hits', '5');
  params.append('size', item.size.toString());

  if (item.title) params.append('title', item.title);
  if (item.author) params.append('author', item.author);

  return params;
}

// 書籍サイズ変換
function mapSize(sizeStr: string): 0 | 1 | 2 | 3 | 9 {
  const map: Record<string, 0 | 1 | 2 | 3 | 9> = {
    '単行本': 1,
    '文庫': 2,
    'コミック': 9,
    '新書': 3,
  };

  return map[sizeStr] ?? 0;
}

// 新刊定義の書籍のみ追加
function hasBookToAdd(book: BookData) {
  if (!book.salesDate) return null;
  const data = formatSalesDate(book.salesDate);
  const bookDate = parseLocalDate(data);
  // 3か月（90日）前の日付を計算
  const ninetyDaysAgo = getDaysAgo(90);

  // 発売日が現在の3か月前から見て未来なら追加する
  if (bookDate >= ninetyDaysAgo) {
    return { ...book,  date: data };
  }
  return null;
}

// 発売日形式変換
function formatSalesDate(salesDate: string) {
  const fullMatch = salesDate.match(/(\d{4})年(\d{2})月(\d{2})日/);
  if (fullMatch) {
    const [, year, month, day] = fullMatch;
    return `${year}-${month}-${day}`;
  }

  const partialMatch = salesDate.match(/(\d{4})年(\d{2})月/);
  if (partialMatch) {
    const [, year, month] = partialMatch;
    return `${year}-${month}-01`;
  }

  return '';
}

// 利用制限回避のための遅延
function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('成功');
    }, ms);
  });
}

