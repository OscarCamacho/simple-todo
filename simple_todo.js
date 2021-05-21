"use strict";
//TODO: necesita que el metodo de agregar elementos con listItem
// Global Variables
let $list; //The list where TODOs are added
let $storage; // The Storage where everything is stored
let $configuration; // The configuration for the application

// Init
window.onload = function init() {
  localStorage.clear();
  initializeUI();
  createTODOListElement({
    text: "list item 1",
    id: "list.0",
    checked: false,
  });
  createTODOListElement({
    text: "list item 2",
    id: "list.1",
    checked: false,
  });
  createTODOListElement({
    text: "list item 3",
    id: "list.2",
    checked: false,
  });
  initializeOrRestoreStorage();
};
function handleInitializationError(initError = "") {
  console.error(
    "There has been an error initializing the application:",
    initError
  );
  initializeConfiguration();
  console.log(
    "Initialized configuration from scratch",
    localStorage.getItem("todo")
  );
}

// Storage functions
function initializeOrRestoreStorage() {
  if (localStorage.getItem("todo")) {
    restoreConfiguration()
      .then(() => {
        console.log(`Obtained configuration`, $configuration);
      })
      .catch((error) => {
        handleInitializationError(error);
      });
  } else {
    initializeConfiguration();
  }
  configureStorageListener();
}
function initializeConfiguration() {
  try {
    localStorage.clear();
    $configuration = { size: 0 };
    localStorage.setItem("todo", JSON.stringify($configuration));
  } catch (configurationInitError) {
    console.error(
      "Error while initializing configuration object",
      configurationInitError
    );
  }
}
function restoreConfiguration() {
  return new Promise((resolve, reject) => {
    try {
      $configuration = JSON.parse(localStorage.getItem("todo"));
      if ($configuration.size && $configuration.size > 0) {
        console.log(`${$configuration.size} entries to be recovered`);
        for (let i = 0; i < $configuration.size; i++) {
          try {
            const recovered = JSON.parse(localStorage.getItem(`list.${i}`));
            if (recovered) {
              createTODOListElement(recovered);
            }
          } catch (itemRecoveryError) {
            console.error(itemRecoveryError);
          }
        }
      } else if ($configuration.size === 0) {
        reject("Nothing to recover");
      } else {
        reject("Non compliant configuration");
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}
function saveListItem(listItem) {
  if (
    listItem &&
    listItem.id &&
    listItem.text &&
    listItem.checked !== undefined
  ) {
    console.log("Item safe to save", $configuration);
    try {
      localStorage.setItem(
        `list.${++$configuration.size}`,
        JSON.stringify(listItem)
      );
      localStorage.setItem("todo", JSON.stringify($configuration));
    } catch (listItemSaveError) {
      throw new Error(listItemSaveError);
    }
  }
}
function configureStorageListener() {
  document.addEventListener("storage", ($event) => {
    console.log(`Storage has changed`, $event);
  });
}

// UI Handlers
function handleItemChecked($event) {
  if ($event.target.parentNode.classList.contains("done")) {
    $event.target.parentNode.classList.remove("done");
  } else {
    $event.target.parentNode.classList.add("done");
  }
}
function handleNewItem($event) {
  const inputText = document.getElementById("textInput").value;
  const inputCheck = document.getElementById("checkInput").value === "on";
  const listItem = {
    text: inputText,
    id: ++$configuration.size,
    checked: inputCheck,
  };
  console.log("Handling new item", listItem);
  saveListItem(listItem);
  // createTODOListElement(listItem);
}

// UI functions
function initializeUI() {
  $list = document.getElementById("list");
  document
    .getElementById("textInput")
    .addEventListener("keypress", ($keyEvent) => {
      console.log(`User input: ${$keyEvent.key}`);
      if ($keyEvent.key == "Enter") {
        document.getElementById("addNewItem").submit();
      }
    });
}
function createTODOListElement(todo) {
  if (todo) {
    const li = document.createElement("li");
    li.id = todo.id;
    const check = document.createElement("input");
    check.type = "checkbox";
    check.value = todo.checked;
    check.onchange = handleItemChecked;
    li.append(check);
    const text = document.createElement("input");
    text.value = todo.text;
    text.type = "text";
    li.append(text);
    $list.appendChild(li);
  }
}
