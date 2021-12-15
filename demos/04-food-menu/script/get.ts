import { request } from "../../utils.js";

export function getFavIds() {
  const favMealStr = localStorage.getItem("fav-meals");

  return JSON.parse(favMealStr ? favMealStr : "[]") as Array<string>;
}

export async function getFavList() {
  const ids = getFavIds();

  return Promise.all(ids.map((id) => getMealById(id)));
}

export async function getMealById(mealId: string) {
  return request({
    url: `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`,
    method: "GET",
    remoteURL: true,
  });
}

export function getMealsBySearch(keyword: string) {
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

export async function getRandomMeals(num: number) {
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
