// Disney Menu Scraper
// Usage: node scrapeDisneyMenus.js

async function scrapeDisneyMenus() {
  const puppeteerExtra = (await import('puppeteer-extra')).default;
  const StealthPlugin = (await import('puppeteer-extra-plugin-stealth')).default;
  puppeteerExtra.use(StealthPlugin());
  const fs = (await import("fs")).default;
  const browser = await puppeteerExtra.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("https://allears.net/dining/menu/", { waitUntil: "networkidle2" });
  // Extract restaurant links with park and location
  const restaurantLinks = await page.$$eval('h2 a[href*="dining/menu/search/all/"]', parkEls => {
    const data = [];
    parkEls.forEach(parkEl => {
      const park = parkEl.textContent.trim();
      const parkSection = parkEl.closest('h2').nextElementSibling;
      if (parkSection) {
        const locEls = parkSection.querySelectorAll('h3 a[href*="dining/menu/search/all/"]');
        locEls.forEach(locEl => {
          const location = locEl.textContent.trim();
          const locSection = locEl.closest('h3').nextElementSibling;
          if (locSection) {
            const links = locSection.querySelectorAll('a[href*="dining/menu/"]');
            links.forEach(link => {
              if (!link.href.includes('/search/')) {
                data.push({
                  name: link.textContent.trim(),
                  href: link.href,
                  park,
                  location
                });
              }
            });
          }
        });
      }
    });
    return data;
  });
  // Scrape all restaurants
  const limitedLinks = restaurantLinks;
  console.log(`Found ${limitedLinks.length} restaurant links.`);
  // Prepare to collect food data
  const allFoodData = [];
  for (const { name, href, park, location } of limitedLinks) {
    try {
      const restaurantPage = await browser.newPage();
      await restaurantPage.goto(href, { waitUntil: "networkidle2" });
      // Log progress for each restaurant
      console.log(`Scraping: ${name} (${href})`);
      // Extract menu categories and items
      const categories = await restaurantPage.$$eval('div.tip', tips => {
        return tips.map(tip => {
          const category = tip.querySelector('h2')?.textContent?.trim() || '';
          const items = Array.from(tip.querySelectorAll('div.menuItems__item')).map(item => {
            const title = item.querySelector('.item-title')?.textContent?.trim() || '';
            const description = item.querySelector('.item-description')?.textContent?.trim() || '';
            const price = item.querySelector('.item-price span')?.textContent?.trim() || '';
            const isDDPSnack = !!item.querySelector('img[src*="ddsnacksymbol.jpg"]');
            return { title, description, price, isDDPSnack };
          });
          return { category, items };
        });
      });
      allFoodData.push({
        restaurant: name,
        location,
        park,
        categories
      });
      await restaurantPage.close();
    } catch (err) {
      console.error(`Error scraping ${name}:`, err);
    }
  }
  // Save results to JSON
  fs.writeFileSync('disney_restaurant_food_data.json', JSON.stringify(allFoodData, null, 2));
  await browser.close();
  console.log("Scraping complete. Data saved to disney_restaurant_food_data.json");
  }

  scrapeDisneyMenus();
