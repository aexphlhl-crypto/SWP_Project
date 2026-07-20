const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  const routes = [
    '/',
    '/movies',
    '/admin',
    '/admin/movies',
    '/admin/analytics'
  ];

  for (const route of routes) {
    console.log('Visiting ' + route);
    try {
      await page.goto('http://localhost:3000' + route, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      console.log('Failed to visit ' + route);
    }
  }

  await browser.close();
  
  if (errors.length > 0) {
    console.log('Console Errors found:');
    console.log(errors);
  } else {
    console.log('No console errors found!');
  }
})();
