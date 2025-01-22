let takeData = async () => {
  try {
    const response = await fetch("bd.json");
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json();

    viewAllData(data);
  } catch (error) {
    console.error(error);
  }
};

const searchItems = document.querySelector(".search-items");

function viewAllData(data) {
  data.sort().forEach((el) => {
    let item = `<li class="search-item" data-id="${el.id}" data-name="${el.name}">
                        <div class="search-item-title-wrapper">
                            <p>${el.name}</p>
                            <button class="btn-add">Добавить</button>
                        </div> 
                    </li>`;

    searchItems.insertAdjacentHTML("beforeend", item);
  });
}

takeData();

// Поиск тарифных зон

const searchInput = document.querySelector(".search-input");

searchInput.addEventListener("input", () => {
  const searchItem = document.querySelectorAll(".search-item");

  searchItem.forEach((el) => {
    if (!el.children[0].textContent.includes(searchInput.value.trim())) {
      el.classList.add("hidden");
    } else {
      el.classList.remove("hidden");
    }
  });
});

// Добавление зоны

let arrSaveData = [];

document.addEventListener("click", (event) => {
  let item = event.target;

  if (item.classList.contains("btn-add")) {
    let id = item.closest(".search-item").getAttribute("data-id");
    if (item.textContent === "Добавить") {
      item.textContent = "Удалить";
      addZone(item.closest(".search-item"));

      let saveData = {
        rate_area_id: id,
        base_charge_value: "",
        extra_charges: [],
      };

      arrSaveData.push(saveData);
    } else {
      item.textContent = "Добавить";
      removeZone(item.closest(".search-item"));

      const index = arrSaveData.findIndex((data) => data.rate_area_id === id);

      if (index !== -1) {
        arrSaveData.splice(index, 1);
      }
    }
  }
});

// function addArrItem(id) {
//   console.log(arrSaveData);
// }

// function removeArrItem(id) {
//   let filtered = arrSaveData.filter((el) => el.rate_area_id !== id);

//   arrSaveData.forEach((el) => {
//     console.log(el.rate_area_id);
//   });

//   arrSaveData = filtered;

//   console.log(arrSaveData);
// }

function addZone(parent) {
  parent.setAttribute("data-status", "active");
  let panel = `
        <div class="price-data">
            <div>
                <p>Базовая стоимость доставки:</p>
                <div>
                <input type="number" class="price-input" pattern="^\d+(\.\d{1,2})?$">
                </div>
                <p>₽</p>
            </div>
            <button class="add-markup">Добавить наценку</button>
        </div>
    `;

  parent.insertAdjacentHTML("beforeend", panel);
}

function removeZone(parent) {
  parent.children[1].remove(0);
  parent.removeAttribute("data-status");
}

document.addEventListener("input", (event) => {
  let parent = event.target.closest(".price-data");

  if (event.target.classList.contains("price-input")) {
    event.target.value.replace(/[^0-9.]/g, "");

    const parts = event.target.value.split(".");
    if (parts.length > 2) {
      event.target.value = parts[0] + "." + parts.slice(1).join("");
    }

    if (parts[1] && parts[1].length > 2) {
      event.target.value = parts[0] + "." + parts[1].slice(0, 2);
    }

    let currentItemId = event.target
      .closest(".search-item")
      .getAttribute("data-id");
    let basePrices = parent.parentElement.querySelectorAll(".markup-data");

    let found = arrSaveData.find((el) => el.rate_area_id === currentItemId);

    found.base_charge_value = event.target.value;
    basePrices.forEach((it) => {
      it.querySelector(".cur-price").textContent = event.target.value;
    });
  }
});

// Добавить наценку

document.addEventListener("click", (event) => {
  let item = event.target;

  if (item.classList.contains("add-markup")) {
    addMarkup(item.closest(".search-item"));
  }
});

function addMarkup(parent) {
  parent.setAttribute("data-status", "active");

  let id = Date.now();

  let panel = `
        <div class="markup-data" data-id=${id}>
            <div class="markup-data-inputs">
                <div>
                    <input type="number" class="markup-input-min inp" pattern="^\d+(\.\d{1,3})?$">
                    <label>кг</label>
                </div>
                <span>-</span>
                <div>
                    <input type="number" class="markup-input-max inp" pattern="^\d+(\.\d{1,3})?$">
                      <label>кг</label>
                </div>
            </div> 
            <div class="markup-data-result-wrapper">
                <div class="markup-data-result">
                    <div>
                        <input type="number" class="markup-price inp" pattern="^\d+(\.\d{1,2})?$">
                        <p>₽</p>
                    </div>
                    <p>Итоговая стоимость: <span class="cur-price"></span> ₽</p>
                </div>
                <button class="delete-markup">Удалить наценку</button>
            </div>
        </div>
    `;

  parent.insertAdjacentHTML("beforeend", panel);
}
let markupSave = {
  min_weight: "",
  max_weight: "",
  charge_value: "",
};

document.addEventListener("input", (event) => {
  if (event.target.classList.contains("markup-input-min")) {
    event.target.value.replace(/[^0-9.]/g, "");

    const parts = event.target.value.split(".");
    if (parts.length > 3) {
      event.target.value = parts[0] + "." + parts.slice(1).join("");
    }

    if (parts[1] && parts[1].length > 3) {
      event.target.value = parts[0] + "." + parts[1].slice(0, 3);
    }

    markupSave.min_weight = event.target.value;
  }

  if (event.target.classList.contains("markup-input-max")) {
    event.target.value.replace(/[^0-9.]/g, "");

    const parts = event.target.value.split(".");
    if (parts.length > 3) {
      event.target.value = parts[0] + "." + parts.slice(1).join("");
    }

    if (parts[1] && parts[1].length > 3) {
      event.target.value = parts[0] + "." + parts[1].slice(0, 3);
    }
    markupSave.max_weight = event.target.value;
  }
});

document.addEventListener("input", (event) => {
  if (event.target.classList.contains("markup-price")) {
    let parent = event.target.closest(".search-item");

    let dpi = parent.querySelectorAll(".markup-data");
    let basePrice = parent.querySelector(".price-input").value;

    dpi.forEach((el) => {
      let finallPrice = el.querySelector(".cur-price");
      let input = el.querySelector(".markup-price");
      finallPrice.textContent = Number(basePrice) + Number(input.value);
    });
  }
});

document.addEventListener("click", (event) => {
  let item = event.target;

  if (item.classList.contains("delete-markup")) {
    item.closest(".markup-data").remove();
  }
});

const saveBtn = document.querySelector(".save-btn");
let group = [];

saveBtn.addEventListener("click", () => {
  const markupPrice = document.querySelectorAll(".markup-price");

  markupPrice.forEach((el) => {
    if (el.value === "") {
      el.parentElement.classList.add("errore-markup");
    } else {
      el.parentElement.classList.remove("errore-markup");
    }
  });

  const priceInput = document.querySelectorAll(".price-input");

  priceInput.forEach((el) => {
    if (el.value === "") {
      el.parentElement.classList.add("errore-price");
    } else {
      el.parentElement.classList.remove("errore-price");
    }
  });

  const markupInputMin = document.querySelectorAll(".markup-input-min");

  const markupInputMax = document.querySelectorAll(".markup-input-max");

  markupInputMax.forEach((el) => {
    if (el.value === "") {
      el.parentElement.classList.add("errore-weight");
    } else {
      el.parentElement.classList.remove("errore-weight");
    }
  });

  markupInputMin.forEach((el) => {
    if (el.value === "") {
      el.parentElement.classList.add("errore-weight");
    } else {
      el.parentElement.classList.remove("errore-weight");
    }
  });

  calcData();
  validateInputs();
  checkWieghtRadio();

  if (hasNonEmptyValues(fullData)) {
    alert("СОХРАНЕНО");
    console.log(fullData);
  }
});

let fullData = [];

let saveData = {
  rate_area_id: "",
  base_charge_value: "",
  extra_charges: [],
};

function calcData() {
  const searchItems = document.querySelectorAll(".search-item");
  fullData.length = 0;
  searchItems.forEach((el) => {
    let status = el.getAttribute("data-status");

    if (status) {
      let saveData = {
        rate_area_id: "",
        base_charge_value: "",
        extra_charges: [],
      };

      let id = el.getAttribute("data-id");
      let basePrice = el.querySelector(".price-input").value;
      let markupDataItems = el.querySelectorAll(".markup-data");

      saveData.rate_area_id = id;
      saveData.base_charge_value = basePrice;

     markupDataItems.forEach((item) => {
        let markupSave = {
          min_weight: "",
          max_weight: "",
          charge_value: "",
        };

        let minWeight = item.querySelector(".markup-input-min").value;
        let maxnWeight = item.querySelector(".markup-input-max").value;
        let curPrice = item.querySelector(".cur-price").textContent;

        markupSave.min_weight = minWeight;
        markupSave.max_weight = maxnWeight;
        markupSave.charge_value = curPrice;

        saveData.extra_charges.push(markupSave);
      });
      fullData.push(saveData);
    }
  });

  if (fullData.length === 0) {
    alert("Доставка не настроена");
  }
}

function validateInputs() {
  group.length = 0;
  const searchItems = document.querySelectorAll(".search-item");

  searchItems.forEach((el) => {
    let status = el.getAttribute("data-status");

    if (status) {
      let markupData = el.querySelectorAll(".markup-data");

      markupData.forEach((item, index) => {
        let id = item.getAttribute("data-id");

        let obj = {
          id: "",
          min: "",
          max: "",
        };

        let minWeight = item.querySelector(".markup-input-min").value;
        let maxnWeight = item.querySelector(".markup-input-max").value;

        obj.min = minWeight;
        obj.max = maxnWeight;
        obj.id = id;
        group.push(obj);
      });
    }
  });
}

function filterOverlappingRanges(arr) {
  return arr.filter((current) => {
    const currentMin = parseInt(current.min);
    const currentMax = parseInt(current.max);

    return arr.some((other) => {
      if (current.id === other.id) return false;
      const otherMin = parseInt(other.min);
      const otherMax = parseInt(other.max);
      return (
        (currentMin <= otherMax && currentMax >= otherMin) ||
        currentMin === otherMin ||
        currentMax === otherMax
      );
    });
  });
}

function checkWieghtRadio() {
  const overlappingObjects = filterOverlappingRanges(group);
  const markupData = document.querySelectorAll(".markup-data");

  markupData.forEach((i) => {
    i.querySelector(".markup-input-min").parentElement.classList.remove(
      "error-input-text"
    );
    i.querySelector(".markup-input-max").parentElement.classList.remove(
      "error-input-text"
    );
  });

  overlappingObjects.forEach((item) => {
    markupData.forEach((it) => {
      let idItem = it.getAttribute("data-id");

      if (idItem === item.id) {
        it.querySelector(".markup-input-min").parentElement.classList.add(
          "error-input-text"
        );
        it.querySelector(".markup-input-max").parentElement.classList.add(
          "error-input-text"
        );
      }
    });
  });
}

function hasNonEmptyValues(arr) {
  if (arr.length === 0) return false;

  let isEmpty = arr.every((obj) => {
    return Object.values(obj).every(
      (value) => value !== null && value !== undefined && value !== ""
    );
  });

  function check() {
    let allInputs = document.querySelectorAll(".inp");
    let arrInputsValues = [];

    allInputs.forEach((it) => {
      arrInputsValues.push(it.value);
    });

    let result = arrInputsValues.every((el) => el !== "");
    return result;
  }

  let result2 = check();

  if (result2 === false || isEmpty === false) {
    return false;
  } else {
    return true;
  }
}
