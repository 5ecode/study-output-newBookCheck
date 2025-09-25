<!-- src/components/calendar.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import multiMonthPlugin from '@fullcalendar/multimonth';
import { formatDate } from '../utils/formatDate';
import type { State, BookWithId } from '../types/common';
import '../assets/calender.css';

/* props
---------------------------------- */
const props = defineProps<{
  books: BookWithId[]
}>();

/* emit
---------------------------------- */
const emit = defineEmits<{
  (e: 'modal-opened', book: BookWithId, event:Event): void
}>();


/* computed
---------------------------------- */
// カレンダーオプション
const calendarOptions = computed(() => ({
  plugins: [multiMonthPlugin],
  initialView: 'multiMonthFourMonth',
  views: {
    multiMonthFourMonth: {
      type: 'multiMonth',
      visibleRange: validRange.value,
    },
  },
  multiMonthMaxColumns: 1,
  showNonCurrentDates: false,
  fixedWeekCount: false,
  contentHeight: 'auto',
  events: props.books.map(book => ({
    title: book.title,
    start: `${book.date}T00:00:00`,
    allDay: true,
    extendedProps: { book },
    color: getColorByState(book.state),
    textColor: '#261100',
  })),
  moreLinkClick: 'popover',
  eventClick(info: any) {
    info.jsEvent.stopPropagation();

    if (info.event.extendedProps.book.state === 'bought') {
      info.jsEvent.preventDefault();
      return;
    }

    const jsEvent: Event = info.jsEvent;
    emit('modal-opened', info.event.extendedProps.book, jsEvent);

    const popoverEls = document.querySelectorAll('.fc-popover');
    popoverEls.forEach(el => el.remove());
  },
  eventDidMount: function (info: any) {
    if (info.event.extendedProps.book.state === 'bought') {
      info.el.classList.add('no-click');
      info.el.setAttribute('title', '購入済');
    }
  },
  headerToolbar: {
    left: '',
    center: '',
    right: '',
  },
  locale: 'ja',
  dayCellContent: function(arg: any) {
    return arg.dayNumberText.replace('日','');
  },
}));

// カレンダーの有効範囲
const validRange = computed(() => {
  if (props.books.length === 0) return undefined;

  const dates = props.books.map(book => new Date(book.date));
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

  // 発売月の初日
  const start = new Date(minDate.getFullYear(), minDate.getMonth(), 1);

  // 発売月の最終日
  const end = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 1);

  return {
    start: formatDate(start),
    end: formatDate(end),
  };
});

/* function
---------------------------------- */
// 状態別の色設定
function getColorByState(state: State): string {
  switch (state) {
  case 'pending':
    return '#fff6b3';
  case 'ordered':
    return '#e2ffb3';
  case 'bought':
    return '#fff';
  case null:
  default:
    return '#e5e5e5';
  }
}
</script>

<template>
  <FullCalendar :options="calendarOptions" />
</template>

