import { createRouter, createWebHistory } from 'vue-router';
import NewBooksView from '../views/NewBooksView.vue';
import EntryView from '../views/EntryView.vue';
import BookShelfView from '../views/BookShelfView.vue';
import WishlistView from '../views/WishlistView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: NewBooksView,
    },
    {
      path: '/entry',
      name: 'Entry',
      component: EntryView,
    },
    {
      path: '/book-shelf',
      name: 'BookShelf',
      component: BookShelfView,
    },
    {
      path: '/wishlist',
      name: 'Wishlist',
      component: WishlistView,
    },
  ],
});

export default router;
