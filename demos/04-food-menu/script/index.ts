import { request } from "../../utils.js";

const menuListDom = document.querySelector(".menu-list") as HTMLElement;

interface MenuType {
  strMealThumb: string;
  idMeal: string;
  strMeal: string;
}

function getFavList() {}

function getMealById(id: string) {
  // www.themealdb.com/api/json/v1/1/lookup.php?i=52772
}

function getMealsBySearch(keywords: string) {
  // www.themealdb.com/api/json/v1/1/search.php?s=Arrabiata
  // www.themealdb.com/api/json/v1/1/search.php?f=a
}

async function getRandomMeals(num: number) {
  // note that the undefined will not be iterated
  const mealRequests = new Array(num).fill(0).map(() => {
    return request({
      url: `https://www.themealdb.com/api/json/v1/1/random.php`,
      method: "GET",
      remoteURL: true,
    });
  });

  return Promise.all(mealRequests);
}

async function renderRandomMeal(meal: MenuType) {
  const menuHTML = `
  <section class="menu">
  <h4 class="tag">Random Menu</h4>
  <img src="${meal.strMealThumb}" alt="${meal.strMeal}" />
  <div class="menu-info">
    <div class="menu-name">${meal.strMeal}</div>
    <button class="fav-btn"><i class="far fa-heart"></i></button>
  </div>
</section>`;

  menuListDom?.insertAdjacentHTML("beforeend", menuHTML);
}

(async () => {
  const meals = (await getRandomMeals(2)) as Array<{ meals: Array<MenuType> }>;

  meals.forEach((meal) => {
    renderRandomMeal(meal.meals[0]);
  });
})();
