import { App } from "./components/app.js";
import { readFilesData } from "./components/readFiles.js";

const store = {
  name: "hashem Sami",
  fileData: {},
  result: {},
  loading: ` <p>Welcome,</p><br>This app will predict the breed of any dog image, please upload your dog image to start processing.
   <p>Or if you want to know what dog breed will the model predict any human,
    you can upload your image or any of your freinds and see which dog breed it will predict.</p>`,
  // fileRows:[]
};

// add our markup to the page
const root = document.getElementById("root");

export const updateStore = newState => {
  const newStore = Object.assign(store, newState);
  console.log(newStore);
  render(root, newStore);
};

const render = async (root, state) => {
  root.innerHTML = App(state);
};

document.addEventListener(
  "DOMContentLoaded",
  () => {
    //event listeners here
    render(root, store);

    document.addEventListener("change", addEventsToOnChangeInputs);
  },
  false
);

const addEventsToFileReader = files => {
  const file = files[0];
  // console.log(files);
  readFilesData(files, store, updateStore);
};

const addEventsToOnChangeInputs = (e, store) => {
  const { target } = e;
  if (target.matches("#file-data")) {
    addEventsToFileReader(target.files);
  }
};
