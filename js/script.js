let tarotDeck = [];

// === Загрузка колоды ===
async function loadTarotDeck() {
  try {
    const [majorResponse, minorResponse] = await Promise.all([
      fetch("json/majorArcana.json"),
      fetch("json/minorArcana.json"),
    ]);

    if (!majorResponse.ok || !minorResponse.ok) {
      throw new Error("Ошибка загрузки файлов");
    }

    const majorArcana = await majorResponse.json();
    const minorArcana = await minorResponse.json();

    tarotDeck = [...majorArcana, ...minorArcana];
  } catch (error) {
    console.error("Ошибка загрузки колоды:", error);
  }
}

// === Работа с cookie ===
function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${date.toUTCString()};path=/`;
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

// === Основная функция вытягивания карты ===
function drawCard(forceShow = false) {
  if (tarotDeck.length === 0) {
    return;
  }

  const lastDrawDate = getCookie("lastDrawDate");
  const savedCardData = getCookie("savedCard");
  const today = new Date().toISOString().slice(0, 10);

  let mainCard, reversed;

  if (lastDrawDate === today && savedCardData && !forceShow) {
    const saved = JSON.parse(savedCardData);
    mainCard = tarotDeck.find((card) => card.name === saved.name);
    reversed = saved.reversed;

    if (!mainCard) {
      console.error("Ошибка загрузки сохраненной карты 😔");
      return;
    }

  } else if (lastDrawDate === today && savedCardData && forceShow) {
    const saved = JSON.parse(savedCardData);
    mainCard = tarotDeck.find((card) => card.name === saved.name);
    reversed = saved.reversed;
  } else {
    const randomIndex = Math.floor(Math.random() * tarotDeck.length);
    reversed = Math.random() > 0.5;
    mainCard = tarotDeck[randomIndex];

    setCookie("lastDrawDate", today, 1);
    setCookie("savedCard", JSON.stringify({ name: mainCard.name, reversed }), 1);
  }

  // === Отрисовка карты ===
  const controls = document.getElementById("controls");
  const taroReading = document.getElementById("taroReading");
  const taroImages = document.getElementById("taroImages");
  const taroDescription = document.getElementById("taroDescription");

  if (!controls || !taroReading || !taroImages || !taroDescription) {
    console.error("Не найдены необходимые элементы DOM");
    return;
  }

  controls.classList.add("hidden");
  taroReading.classList.remove("hidden");
  taroImages.innerHTML = "";
  taroDescription.innerHTML = "";

  for (let i = 0; i < 3; i++) {
    const cardWrapper = document.createElement("div");
    cardWrapper.className = `card-wrapper card-${i + 1}`;

    const cardImage = document.createElement("img");
    cardImage.className = "card-image";

    if (i === 1) {
      cardImage.src = "images/" + mainCard.image;
      cardImage.alt = mainCard.name;
      if (reversed) cardImage.classList.add("reversed");
    } else {
      cardImage.src = "img/back.jpg";
      cardImage.alt = "Рубашка карты";
    }

    cardWrapper.appendChild(cardImage);
    taroImages.appendChild(cardWrapper);
  }

  const cardDescription = reversed
    ? mainCard.reversed_description
    : mainCard.upright_description;
  const cardMeaning = reversed ? mainCard.reversed : mainCard.upright;

  const descriptionHTML = `
    <div class="card-name">${mainCard.name} ${
    reversed ? "(Перевернутая)" : "(Прямая)"
  }</div>
    <div class="card-position">${cardMeaning}</div>
    <p>${cardDescription}</p>
  `;

  taroDescription.innerHTML = descriptionHTML;
}

document.addEventListener("DOMContentLoaded", async function () {
  const controls = document.getElementById("controls");
  const taroReading = document.getElementById("taroReading");

  if (controls) controls.classList.add("hidden");
  if (taroReading) taroReading.classList.add("hidden");

  await loadTarotDeck();

  const drawButton = document.getElementById("drawButton");
  if (drawButton) {
    drawButton.addEventListener("click", drawCard);
  } else {
    console.error("Кнопка не найдена!");
  }

  // === Проверяем, есть ли карта за сегодня ===
  const lastDrawDate = getCookie("lastDrawDate");
  const today = new Date().toISOString().slice(0, 10);
  const savedCardData = getCookie("savedCard");

  if (lastDrawDate === today && savedCardData) {
    drawCard(true);
  } else {
    if (controls) controls.classList.remove("hidden");
  }
});
