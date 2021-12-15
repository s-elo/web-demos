import { request, scrollDownListener, setStyle } from "../../utils.js";
import {
  getFavIds,
  getFavList,
  getMealsBySearch,
  getRandomMeals,
} from "./get.js";

const menuListDom = document.querySelector(".menu-list") as HTMLElement;
const favListDom = document.querySelector(".fav-list ul") as HTMLUListElement;
const searchBtn = document.querySelector("#search-btn") as HTMLButtonElement;
const searchInput = document.querySelector("#search-input") as HTMLInputElement;
const infoContainer = document.querySelector("#info-container") as HTMLElement;
const infoSection = document.querySelector(
  "#info-container .meal-info"
) as HTMLElement;
const infoCloseTag = document.querySelector(
  "#info-container .close-tag"
) as HTMLDivElement;

interface MenuType {
  strMealThumb: string;
  idMeal: string;
  strMeal: string;
  strInstructions: string;
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

// when scroll down, show more meals
scrollDownListener(
  menuListDom,
  async () => {
    const meals = (await getRandomMeals(2)) as RespType;

    meals.forEach((m) => renderMeal(m.meals[0], true));
  },
  1
);

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

infoCloseTag.addEventListener("click", () => {
  infoContainer.classList.remove("info-active");
});

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
  const imgDom = menuDom.querySelector("img");

  favBtnDom?.addEventListener("click", () => {
    const favHeart = favBtnDom.firstChild as HTMLElement;

    if ([...favHeart.classList].includes("far")) {
      favHeart.classList.remove("far");
      favHeart.classList.add("fas");
      addToFavList(meal); // add
    } else {
      favHeart.classList.remove("fas");
      favHeart.classList.add("far");
      removeFromFavList(meal.idMeal); // remove
    }
  });

  imgDom?.addEventListener("click", () => {
    renderInfo(meal);

    infoContainer.classList.add("info-active");
  });

  menuListDom?.appendChild(menuDom);
}

function renderFavMeal(meal: MenuType) {
  const liDom = document.createElement("li");
  liDom.setAttribute("id", `fav-${meal.idMeal}`);

  const favMenuHTML = `
  <img src="${meal.strMealThumb}" alt="${meal.strMeal}" title="${meal.strMeal}">
  <div class="fav-menu-name" title="${meal.strMeal}">${meal.strMeal}</div>
  <div class="remove-tag">-</div>
  `;

  liDom.innerHTML = favMenuHTML;

  const removeTagDom = liDom.querySelector(".remove-tag") as HTMLDivElement;

  liDom.addEventListener("mouseenter", () => {
    setStyle(removeTagDom, { transform: "scale(1, 1)" });
  });

  liDom.addEventListener("mouseleave", () => {
    setStyle(removeTagDom, { transform: "scale(0, 0)" });
  });

  liDom.addEventListener("click", () => {
    renderInfo(meal);

    infoContainer.classList.add("info-active");
  });

  removeTagDom.addEventListener("click", (e) => {
    e.stopPropagation();
    removeFromFavList(meal.idMeal);
  });

  favListDom.appendChild(liDom);
}

function addToFavList(meal: MenuType) {
  // render the actual dom
  renderFavMeal(meal);

  const favMeals = getFavIds();

  favMeals.push(meal.idMeal);
  localStorage.setItem("fav-meals", JSON.stringify(favMeals));
}

function removeFromFavList(mealId: string) {
  // remove the actual dom
  const favMealDom = favListDom?.querySelector(`#fav-${mealId}`);

  favMealDom?.parentNode?.removeChild(favMealDom);

  const favMeals = getFavIds();
  localStorage.setItem(
    "fav-meals",
    JSON.stringify(favMeals.filter((id) => id !== mealId))
  );
}

function renderInfo(meal: MenuType) {
  // clear first
  infoSection.innerHTML = "";

  const infoHTML = `
  <header class="meal-name">${meal.strMeal}</header>
  <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
  <section class="meal-intro">${meal.strInstructions}</section>`;

  infoSection.insertAdjacentHTML("beforeend", infoHTML);
}
