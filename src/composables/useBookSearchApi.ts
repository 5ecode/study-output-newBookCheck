// src/composables/useBookSearchApi.ts
import axios from 'axios';
import { useNewBooksStore } from '../stores/NewBooksStore';
import type { KeywordSet, BookData } from '../types/common';

interface RakutenApiItem {
  title: string
  author: string
  largeImageUrl: string
  itemUrl: string
  isbn: string
  salesDate: string
}

const APP_ID = import.meta.env.VITE_RAKUTEN_APP_ID;

// 新刊情報を取得
export async function useBookSearchApi(keywordSet: KeywordSet[]) {
  const useNewBooks = useNewBooksStore();

  for (const item of keywordSet) {
    try {
      const baseUrl = 'https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404';
      const res = await axios.get(baseUrl, { params: buildQueryParams(item) });
      const data = res.data;

      const newBooks: BookData[] = data.Items.map((item: { Item: RakutenApiItem }) => ({
        title: item.Item.title,
        author: item.Item.author,
        imageUrl: item.Item.largeImageUrl,
        salesDate: item.Item.salesDate,
        itemUrl: item.Item.itemUrl,
        isbn: item.Item.isbn,
      }));

      // 補足データを追加
      const enrichedResults: BookData[] = [];
      for (const book of newBooks) {
        const enriched = addRegularDate(book);
        if (enriched) {
          enrichedResults.push(enriched);
        }
      }

      useNewBooks.addNewBooks(enrichedResults);

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
  params.append('applicationId', APP_ID);
  params.append('outOfStockFlag', '1');
  params.append('hits', '5');
  params.append('size', item.size.toString());

  if (item.title) params.append('title', item.title);
  if (item.author) params.append('author', item.author);

  return params;
}

function addRegularDate(book: BookData) {
  if (book.salesDate) {
    const data = formatSalesDate(book.salesDate);
    const bookDate = new Date(data);
    const now = new Date();
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(now.getMonth() - 3);
    if (bookDate >= twoMonthsAgo) {
      return { ...book,  date: data };
    }
  }
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
