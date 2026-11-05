import { NoticeApp } from './components/noticeApp.js';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('noticeAppContainer');
  if (container) {
    new NoticeApp(container);
  }
});

