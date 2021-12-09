import { request } from "../../utils.js";

const menuListDom = document.querySelector(".menu-list") as HTMLElement;
const favListDom = document.querySelector(".fav-list ul") as HTMLUListElement;
const searchBtn = document.querySelector("#search-btn") as HTMLButtonElement;
const searchInput = document.querySelector("#search-input") as HTMLInputElement;

interface MenuType {
  strMealThumb: string;
  idMeal: string;
  strMeal: string;
}
type RespType = Array<{ meals: Array<MenuType> }>;

(async () => {
  const meals = (await getRandomMeals(2)) as RespType;

  meals.forEach((meal) => {
    renderMeal(meal.meals[0], true);
  });

  const favMeals = (await getFavList()) as RespType;

  favMeals.forEach((meal) => {
    renderFavMeal(meal.meals[0]);
  });
})();

searchBtn?.addEventListener("click", async () => {
  const keyword = searchInput.value;

  const searchMeals = (await getMealsBySearch(keyword)) as RespType | null;

  // clear
  menuListDom.innerHTML = "";

  if (searchMeals) {
    if (searchMeals[0].meals == null) {
      const meals = (await getRandomMeals(2)) as RespType;
      meals.forEach((m) => {
        renderMeal(m.meals[0], true);
      });
    } else {
      renderMeal(searchMeals[0].meals[0], false);
    }
  } else {
    const meals = (await getRandomMeals(2)) as RespType;
    meals.forEach((m) => {
      renderMeal(m.meals[0], true);
    });
  }
});

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

  return Promise.all(ids.map((id) => getMealById(id)));
}

async function getMealById(mealId: string) {
  return request({
    url: `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`,
    method: "GET",
    remoteURL: true,
  });
}

function getMealsBySearch(keyword: string) {
  // www.themealdb.com/api/json/v1/1/search.php?s=Arrabiata
  // www.themealdb.com/api/json/v1/1/search.php?f=a
  if (keyword.trim() === "") {
    return null;
  }

  return Promise.all([
    request({
      url: `https://www.themealdb.com/api/json/v1/1/search.php?s=${keyword}`,
      method: "GET",
      remoteURL: true,
    }),
  ]);
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

function renderMeal(meal: MenuType, isRandom: Boolean) {
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
