import { request } from "../../utils.js";

const menuListDom = document.querySelector(".menu-list") as HTMLElement;
const favListDom = document.querySelector(".fav-list ul");

interface MenuType {
  strMealThumb: string;
  idMeal: string;
  strMeal: string;
}

(async () => {
  const meals = (await getRandomMeals(2)) as Array<{ meals: Array<MenuType> }>;

  meals.forEach((meal) => {
    renderMealList(meal.meals[0], true);
  });

  const favMeals = (await getFavList()) as Array<{ meals: Array<MenuType> }>;
  console.log(favMeals);

  favMeals.forEach((meal) => {
    renderFavMeal(meal.meals[0]);
  });
})();

function addToFavList(mealId: string) {
  const favMeals = getFavIds();

  favMeals.push(mealId);
  localStorage.setItem("fav-meals", JSON.stringify(favMeals));
}

function removeFromFavList(mealId: string) {
  const favMeals = getFavIds();
  localStorage.setItem(
    "fav-meals",
    JSON.stringify(favMeals.filter((id) => id !== mealId))
  );
}

function getFavIds() {
  const favMealStr = localStorage.getItem("fav-meals");

  return JSON.parse(favMealStr ? favMealStr : "[]") as Array<string>;
}

async function getFavList() {
  const ids = getFavIds();

  return Promise.all(
    ids.map((id) => {
      return request({
        url: `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`,
        method: "GET",
        remoteURL: true,
      });
    })
  );
}

function getMealById(mealId: string) {
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

function renderMealList(meal: MenuType, isRandom: Boolean) {
  const menuDom = document.createElement("section");
  menuDom.classList.add("menu");

  const isFavMeal = getFavIds().includes(meal.idMeal);

  menuDom.innerHTML = `
  <h4 class="tag">${isRandom ? `Random Meal` : `Search Meal`}</h4>
  <img src="${meal.strMealThumb}" alt="${meal.strMeal}" />
  <div class="menu-info">
    <div class="menu-name">${meal.strMeal}</div>
    <button class="fav-btn"><i class="${
      isFavMeal ? "fas" : "far"
    } fa-heart"></i></button>
  </div>`;

  // the menuDom can be treated as a dom already
  // but not being mount
  const favBtnDom = menuDom.querySelector(".menu-info .fav-btn");

  favBtnDom?.addEventListener("click", () => {
    const favHeart = favBtnDom.firstChild as HTMLElement;

    if ([...favHeart.classList].includes("far")) {
      favHeart.classList.remove("far");
      favHeart.classList.add("fas");
      addToFavList(meal.idMeal); // add

      renderFavMeal(meal);
    } else {
      favHeart.classList.remove("fas");
      favHeart.classList.add("far");
      removeFromFavList(meal.idMeal); // remove

      removeFavMeal(meal.idMeal);
    }
  });

  menuListDom?.appendChild(menuDom);
}

function renderFavMeal(meal: MenuType) {
  const favMenuHTML = `
  <li id="fav-${meal.idMeal}">
    <img src="${meal.strMealThumb}" alt="${meal.strMeal}" title="${meal.strMeal}">
    <div class="fav-menu-name" title="${meal.strMeal}">${meal.strMeal}</div>
  </li>
  `;

  favListDom?.insertAdjacentHTML("beforeend", favMenuHTML);
}

function removeFavMeal(mealId: string) {
  const favMealDom = favListDom?.querySelector(`#fav-${mealId}`);

  favMealDom?.parentNode?.removeChild(favMealDom);
}
