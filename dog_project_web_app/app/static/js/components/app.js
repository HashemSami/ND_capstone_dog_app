import { renderResults } from "./results.js";

const App = ({ name, fileData, result, loading }) => {
  return `
  <div id="container">
    <div id="input-display">
      <h1 id='main-title'>Dog Breed Predictor</h1>
      <label class='file-upload-input'>
        <input id="file-data" type="file" accept="image/*" size='70' />
        Click here to add you Dog or Human Image
      </label>
    </div>
    <div class="results-display">
      ${
        result && Object.keys(result).length == 0 && loading !== ""
          ? `<div class='result-title'>
              <h2 >${loading}</h2>
            </div> `
          : ""
      }
      ${
        fileData && result && Object.keys(result).length !== 0
          ? renderResults(fileData, result)
          : ""
      }
    </div>

  </div>
  `;
};

// ============================================================================================

export { App };
