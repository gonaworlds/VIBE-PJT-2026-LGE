import { InquiryApp } from './components/inquiryApp.js';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('inquiryAppContainer');
  if (container) {
    new InquiryApp(container);
  }
});

