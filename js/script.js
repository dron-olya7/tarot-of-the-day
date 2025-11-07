let tarotDeck = [];

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

function drawCard() {
  if (tarotDeck.length === 0) {
    alert("Колода еще загружается. Пожалуйста, подождите...");
    return;
  }

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

  for (let i = 0; i < 3; i++) {
    const cardWrapper = document.createElement("div");
    cardWrapper.className = `card-wrapper card-${i + 1}`;

    const cardImage = document.createElement("img");
    cardImage.className = "card-image";

    if (i === 1) {
      cardImage.src = "images/" + mainCard.image;
      cardImage.alt = mainCard.name;
      if (reversed) {
        cardImage.classList.add("reversed");
      }
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

document.addEventListener("DOMContentLoaded", function () {
  loadTarotDeck();

  const drawButton = document.getElementById("drawButton");
  if (drawButton) {
    drawButton.addEventListener("click", drawCard);
  } else {
    console.error("Кнопка не найдена!");
  }
});
