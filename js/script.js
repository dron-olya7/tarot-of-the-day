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
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

// === Красивое сообщение вместо alert ===
function showMessage(text) {
  let messageBox = document.getElementById("messageBox");
  if (!messageBox) {
    messageBox = document.createElement("div");
    messageBox.id = "messageBox";
    messageBox.style.position = "fixed";
    messageBox.style.top = "50%";
    messageBox.style.left = "50%";
    messageBox.style.transform = "translate(-50%, -50%)";
    messageBox.style.background = "rgba(0,0,0,0.85)";
    messageBox.style.color = "#fff";
    messageBox.style.padding = "20px 30px";
    messageBox.style.borderRadius = "10px";
    messageBox.style.zIndex = "9999";
    messageBox.style.textAlign = "center";
    messageBox.style.fontSize = "18px";
    messageBox.style.maxWidth = "320px";
    messageBox.style.boxShadow = "0 4px 15px rgba(0,0,0,0.4)";
    messageBox.style.transition = "opacity 0.3s";
    document.body.appendChild(messageBox);
  }

  messageBox.textContent = text;
  messageBox.style.opacity = "1";
  messageBox.style.display = "block";

  setTimeout(() => {
    messageBox.style.opacity = "0";
    setTimeout(() => (messageBox.style.display = "none"), 300);
  }, 3000);
}

// === Основная функция вытягивания карты ===
function drawCard() {
  if (tarotDeck.length === 0) {
    showMessage("Колода еще загружается. Пожалуйста, подождите...");
    return;
  }

  // === Ограничение: 1 раз в день через cookie ===
  const lastDrawDate = getCookie("lastDrawDate");
  const today = new Date().toISOString().slice(0, 10);

  if (lastDrawDate === today) {
    showMessage("Вы уже вытянули карту сегодня 🌙\nПопробуйте завтра!");
    return;
  }

  // Сохраняем сегодняшнюю дату в cookie на 1 день
  setCookie("lastDrawDate", today, 1);
  // === Конец ограничения ===

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

  const randomIndex = Math.floor(Math.random() * tarotDeck.length);
  const isReversed = Math.random() > 0.5;
  const mainCard = tarotDeck[randomIndex];
  const reversed = isReversed;

  // === Отображаем 3 карты (центральная — основная) ===
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
    <div class="card-name">${mainCard.name} ${reversed ? "(Перевернутая)" : "(Прямая)"}</div>
    <div class="card-position">${cardMeaning}</div>
    <p>${cardDescription}</p>
  `;

  taroDescription.innerHTML = descriptionHTML;
}

// === Запуск при загрузке страницы ===
document.addEventListener("DOMContentLoaded", function () {
  loadTarotDeck();

  const drawButton = document.getElementById("drawButton");
  if (drawButton) {
    drawButton.addEventListener("click", drawCard);
  } else {
    console.error("Кнопка не найдена!");
  }
});
