// src/composables/useUpdateWishlist.ts
import { useNewBooksStore } from '../stores/NewBooksStore';
import { useWishlistStore } from '../stores/WishlistStore';

// 保留リストの更新
export function useUpdateWishlist() {
  const useNewBooks = useNewBooksStore();
  const useWishlist = useWishlistStore();

  const newBooks = useNewBooks.books;
  const wishlistBooks = useWishlist.books;
  let wishlistUpdate = false;

  // 同じISBNがあれば、データを比較して差異があれば保留リストを更新
  for (const newBook of newBooks) {
    const matchingBook = wishlistBooks.find((book) => book.isbn === newBook.isbn);
    if (matchingBook) {
      // 差異がある個所だけ更新
      if (matchingBook.salesDate !== newBook.salesDate) {
        matchingBook.salesDate = newBook.salesDate;
        wishlistUpdate = true;
      }
      if (matchingBook.imageUrl !== newBook.imageUrl) {
        matchingBook.imageUrl = newBook.imageUrl;
        wishlistUpdate = true;
      }
    }
  }
  // 保留リストが更新されたらストア更新
  if (wishlistUpdate) {
    useWishlist.saveToStorage();
  }
}
