// Convert JSON to CSV
import fs from 'fs';

const data = JSON.parse(fs.readFileSync('disney_restaurant_food_data.json', 'utf8'));

const csvRows = ['ITEM,RESTAURANT,CATEGORY,DINING PLAN,LOCATION,DISNEY PARK,DESCRIPTION,PRICE,IS_DDP_SNACK'];

data.forEach(restaurant => {
  const { restaurant: restName, location, park, categories } = restaurant;
  categories.forEach(cat => {
    cat.items.forEach(item => {
      const diningPlan = item.isDDPSnack ? 'Snack' : '';
      const isDDPSnack = item.isDDPSnack ? 'true' : 'false';
      const row = [
        `"${item.title.replace(/"/g, '""')}"`,
        `"${restName.replace(/"/g, '""')}"`,
        `"${cat.category.replace(/"/g, '""')}"`,
        `"${diningPlan}"`,
        `"${location.replace(/"/g, '""')}"`,
        `"${park.replace(/"/g, '""')}"`,
        `"${item.description.replace(/"/g, '""')}"`,
        `"${item.price.replace(/"/g, '""')}"`,
        isDDPSnack
      ].join(',');
      csvRows.push(row);
    });
  });
});

fs.writeFileSync('disney_food_data.csv', csvRows.join('\n'));
console.log('CSV saved to disney_food_data.csv');