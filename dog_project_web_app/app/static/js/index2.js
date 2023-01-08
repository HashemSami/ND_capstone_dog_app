// ============================================================================================
// utils

const getWellName = (wellNameList) => {
  return wellNameList.join("_");
};

const getDataName = (wellName , logName) => {
  return `${wellName}/${logName}`;
};

const getLogName = dataname => {
  return dataname.split('/')[1];
};

const currentCutoffs = {};

let currentTe = 0;

let chartElement={};
let chartObject={};

// ============================================================================================
// Store

const root = document.getElementById('root');

const store = {
  name: 'hashem Sami',
  fileData:{},
  userCutoff:{},
  result:{}
  // fileRows:[]
};

const render =(root, state) =>{
  root.innerHTML = App(state);
};

const updateStore = (newState) => {
  const newStore = Object.assign(store, newState);
  console.log(newStore);
  render(root, newStore);
};

// ============================================================================================
// UI
const App = ({name, fileData, result, userCutoff}) => {
  const {wellName, logsRanges, logsList, depthRange, errors} = fileData;
  // console.log(logsRanges)

  const errMessage = fileData && errors && errors.length && errors.map(m=>m);

  console.log(Object.keys(result).length===0&&result.constructor===Object);
  console.log(result===false);

  if(errMessage){
    return `
    <div id="container">
    <div id="input-display">
      <h1 id='main-title'>   Calculator</h1>
      <label class='file-upload-input'>
        <input id="file-data" type="file" size='70' multiple/>
        Click here to add you LAS files
      </label>
    </div>
    <div class="results-display ">
      <div class= 'err-msg'>
      ${errMessage.map(m=>`<p>${m}</p>`).join('')}
      </div>
    </div>
  </div>
    ` ;
  };

  return `
  <div id="container">
    <div id="input-display">
      <h1 id='main-title'>Reservoir Calculator</h1>
      <label class='file-upload-input'>
        <input id="file-data" type="file" size='70' multiple/>
        Click here to add you LAS files
      </label>
      ${fileData && wellName ? userForm(wellName, logsRanges, logsList, userCutoff, depthRange):''}
    </div>
    <div class="results-display">
      ${fileData && wellName && result&&Object.keys(result).length!==0&&result.constructor===Object ? renderResults(wellName, result, userCutoff):''}
      <div class='result-footage-chart'>
        <canvas class='footage-chart canv-hide'/>
      </div>
    </div>

  </div>
  `;
};

const userForm = (wellName, logsRanges, logsList, userCutoff, depthRange) => {
  const wellNameS = getWellName(wellName);

  const userInput =  logsList.map(log =>{
    const dataName = getDataName(wellNameS, log);
    const logRange = logsRanges[dataName];
    if(!currentCutoffs[dataName]){
      Object.assign(currentCutoffs, {[dataName]:{min:0,max:0}});
    };
    const cutoff = currentCutoffs[dataName];
    // const cutoff = {min:0, max:0};
    return renderInput(dataName, logRange, cutoff);
  }).join('');

  const userTe = `
  <div id='te-input'>
    <div class='input-title'>Please provide target entry:</div>
    <p>Minimum depth found on the logs at ${depthRange[0]}</p>
    <p>Maximum depth found on the logs at ${depthRange[1]}</p>
    <input required='true' id='te-value' type="number" value=${currentTe} name='te' min=${depthRange[0]} max=${depthRange[1]} placeholder="Your min value"/>
  </div>
  `;
  return `
  <div id="user-form">
    <h2 class='well-name'>${wellNameS}</h2>
    <form id='user-input-form'>
      ${userTe}
      <div class='cutoff-message' >Please provide your cutoff for data below:</div>
      ${userInput}
      <div id="calculate-button">
        <button type="submit" >Calculate</button>
      </div>
    </form>
  </div>
  `;
}

const renderInput = (logName, ranges, cutoff) => {
  const {min, max} = cutoff;
return `
<div class='log-cutoff-input'>
  <div class='input-title'>${getLogName(logName)}</div>
  <p>Minimum value found on this log is ${ranges[0]}</p>
  <p>Maximum value found on this log is ${ranges[1]}</p>
  <div class="range-input">
    <div>Minimum Value:
      <input required='true' class='cutoff-input' type="number" step='0.01' value='${min}' name='min-${logName}' min='${Math.floor(ranges[0])}' max='${Math.round(ranges[1])}' placeholder="Your min value"/>
    </div>
    <div>Maximum Value:
      <input required='true' class='cutoff-input' type="number" step='0.01' value='${max}' name='max-${logName}' min='${Math.floor(ranges[0])}' max='${Math.round(ranges[1])}' placeholder="Your max value"/>
    </div>
  </div>
</div>
`;

};

const renderResults = (wellName, result, userCutoff) => {
  // const {wellName} = fileData;
  if(!wellName && !result.wellName){
    return''
  };

  const wellNameS = getWellName(wellName);
  const {TGF, TRF, TRC, eachLogPercent, eachLogAvr, ranges, claculatedLogs} = result;

  return `
  <div class='result-title'>
    <h1 >${wellNameS}</h1>
  </div>
  <div class='result-values'>
    <div class='values-card'>
      <table>
        <tr>
          <th>Total Geosteered Footage:</th>
          <td>${TGF} ft</td>
        </tr>
        <tr>
          <th>Total Reservoir Footage:</th>
          <td>${TRF} ft</td>
        </tr>
        <tr>
          <th>Total Reservoir Contact:</th>
          <td>${TRC} %</td>
        </tr>
      </table>
    </div>
  </div>
  <div class='result-log-charts'>
    <h3>Calculations Details</h3>
      <div class='each-log-card'>
        <table>
          <thead>
            <th>Log Name</th>
            <th>Cutoff</th>
            <th>Last Log Depth</th>
            <th>Average Matched Values</th>
            <th>Cutoff Match</th>
          </thead>
           <tbody>
            ${Object.keys(eachLogPercent).map(logName=>{
            return `
            <tr>
              <td>${getLogName(logName)}</td>
              <td>${userCutoff[logName].min} To ${userCutoff[logName].max}</td>
              <td>${ranges[logName]}</td>
              <td>${eachLogAvr[logName]!==0?`${eachLogAvr[logName]}`:'Out of target entry range'}</td>
              <td>${eachLogPercent[logName]!==0?`${eachLogPercent[logName]} %`:'Out of target entry range'}</td>
            </tr>
            `
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
};

// ============================================================================================

// Get file info

const checkForWellName = (row) =>{
  const wellNameFound = /WELL/.exec(row);
  if(wellNameFound){
    const wellName = /[A-Za-z]*_.*_[0-9]+/.exec(row);
    console.log(wellName? wellName[0]:null);
    return wellName? wellName[0].split('_'):null;
  };

};

const checkForTdDepth= (row) => {
  const tdFound = /TD/.exec(row);
  if(tdFound){
    const tdDepth = /[0-9]+/.exec(row);
    console.log(tdDepth? tdDepth[0]:null);
    return tdDepth? tdDepth[0]:null;
  };
};

const checkForFirstLog = (row) => {
  const logHeaderFound = /~A/.exec(row);
  let logName = null;

  let logFound = false;

  if (logHeaderFound) {
    // const re = /\s*(?: |$)\s*/
    const re = /(\w+)/g;

    const logsRow = row.match(re);


    if(logsRow.length > 1){
      logName = [];

      logsRow.forEach((log,i)=>{
          if(i===0 || i===1 || log === ""){
              return;
          };
          logName.push(log);
      });

      console.log(logName);
      logFound = true;

    };

  };

  return [logFound, logName];
};

const getWellInfo = (row) => {
  const wellName = checkForWellName(row);

  const tdDepth = checkForTdDepth(row);

  const [isLogDataStarted, logName] = checkForFirstLog(row);

  return [wellName, tdDepth, isLogDataStarted, logName];
};
// ============================================================================================
// Get logs Data

const getLogsData =  (row) => {
  // const re = /\s*(?: |$)\s*/
  const re = /(-?\d+.?\d+)/g;
  const logDataMatch = row.match(re);

  if(logDataMatch){
    const logData = logDataMatch.map(n=>parseFloat(n));

    const logDataValues = [];
    logData.forEach((log,i) =>{
        if(i === 0){
            return;
        };
        logDataValues.push([logData[0], logData[i] < -999.0? -999.0 : logData[i]]);
    });

    // console.log(logDataValues)
    return logDataValues;
  };

  return null;
};
// ============================================================================================
// Get log name if the first method couldn't find the name

const getWellLogNameSecond = (wellInfoArray)=>{
  // console.log(wellInfoArray)

  let rowLogNameNumber = 0

  let logName = null;

  let logFound = false;

  wellInfoArray.forEach((info,i) => {
    const logCurveNameFound = /~Curve/.exec(info);

    if(logCurveNameFound){
      rowLogNameNumber = i
      const firstLogNameRow = wellInfoArray[rowLogNameNumber+1]
      const secondLogNameRow = wellInfoArray[rowLogNameNumber+2]

      console.log(firstLogNameRow, secondLogNameRow)


      const re = /(\w+)/g;

      const logsRow1 = firstLogNameRow.split('.');
      const logsRow2 = secondLogNameRow.split('.');

      console.log('logs Namessss', logsRow1[0], logsRow2[0])

      logName = [logsRow2[0]]
      logFound = true;
    }
  })

  return [logFound, logName];
}

// ============================================================================================
// Get file object

const getFileDataObject = (file) => {
    // TODO: loop in each file to set file data

    const wellInfoArray = [];
    const errors = [];
    const fileData = {};

    const setFileData = (newData) => {
      Object.assign(fileData, newData);
    };

    const logsData = {};
    const logsRanges = {};
    const depthRange = [0, 0];
    // const logNames = [];
    let logsList = [];

    let wellNameG = '';
    let logStart = false;

    file.forEach( (row)=>{
      // console.log(row)
        if(row){
          // try{
            if(logStart){
              // try{
                  const wellName = getWellName(fileData["wellName"]);
                  const currentLogsNames = fileData["logName"];
                  const logDataValues = getLogsData(row);

                  if(logDataValues){
                    depthRange[0] < logDataValues[0][0] && depthRange[0] !== 0?
                    depthRange[0] = depthRange[0] : depthRange[0] = Math.round(logDataValues[0][0]);

                    depthRange[1] > logDataValues[0][0] ?
                    depthRange[1] =  depthRange[1]:depthRange[1] = Math.round(logDataValues[0][0]);

                    logDataValues.forEach((log,i)=>{
                      const dataName = getDataName(wellName, currentLogsNames[i]);

                      // distribute values
                      logsData[dataName]? logsData[dataName].push(logDataValues[i])
                      : logsData[dataName] = [logDataValues[i]];

                      // get log ranges
                      if(logsRanges[dataName]){
                        if (log[1] < logsRanges[dataName][0] && log[1] > -1)logsRanges[dataName][0] = log[1];
                        if (log[1] > logsRanges[dataName][1]) logsRanges[dataName][1] = log[1];
                      }else{
                        logsRanges[dataName] = [0, 0];
                      };

                    });

                    if(logDataValues[0] === NaN){
                      logStart = false;
                    };
                  }
                  else {
                    if(row.split('').length > 1){
                      logStart = false;
                    }
                  };


              // }catch(e){
              //     console.log(e)

              // }

            }else{
              const [wellName, tdDepth, isLogDataStarted, logName] = getWellInfo(row);

              wellInfoArray.push(row)

              if (wellName){
                const wellNameS = getWellName(wellName);

                if(wellNameG === '') wellNameG = wellNameS;

                if(wellNameG !== wellNameS) errors.push('Your log runs do not belong to the same well');

                setFileData({wellName});
              };


              if(tdDepth) setFileData({tdDepth});

              if(logName){
                console.log(logName);
                setFileData({logName});

                logName.forEach(log=>{
                    if(logsList.indexOf(log) > -1){
                      errors.push(`You are using multiple runs of ${log}. Please Download only the last run as it will have the leatest log data`);
                    };
                });

                logsList = logsList.concat(logName);

                setFileData({logsList});

                logStart = isLogDataStarted;
              }else{
                const logHeaderFound = /~A/.exec(row);
                let logName = null;

                let logFound = false;

                if (logHeaderFound) {
                const [logFound, logsNameSecond] = getWellLogNameSecond(wellInfoArray);

                  setFileData({logName: logsNameSecond});
                  setFileData({logsList: logsNameSecond});

                  console.log('log Found:::: ', logFound)

                  logStart = logFound;
                };
              };
              // console.log(isLogDataStarted)


            };

          // }catch(e){
          //     console.log(e)

          // }

        }else{
          console.log(row)
        };
    });

    // console.log(wellInfoArray)

    setFileData({logsRanges});
    setFileData({logsData});
    setFileData({depthRange});
    setFileData({errors});
    // console.log(logsData)
    console.log(errors);
    console.log(fileData);

    return fileData;

    // TODO: if errors exists we need to stop the app and put for the user
};

// ============================================================================================
// Calculate logs

const calculateFootage = (userTe, cutoffValue, logData) => {
  let calculatedLogs = [];

  const {min, max} = cutoffValue;
  console.log(min, max, userTe);

  logData.forEach(valuesList=>{
    const depth = valuesList[0];
    const logValue = valuesList[1];

    if(logValue < -1){
      return;
    };

    if(depth >= userTe){
      if(logValue >= min && logValue <= max){
        calculatedLogs.push([depth, logValue, true]);
      }else{
        calculatedLogs.push([depth, logValue, false]);
      };
    }else{
      calculatedLogs=[[0,0,0]];
    };
  });

  // console.log(calculatedLogs)
  return calculatedLogs;
}

// -------------------------------------
const calculateSumLogs = (logsLength, calculatedLogs) =>{
  const logObject = {};

  const eachLogPoints = {};

  const eachLogValue = {};

  const totalGeosteeredPoints = logsLength;
  let totalReservoirPoints = 0;

  for(let logNumber=0; logNumber<= logsLength; logNumber++){
    logObject[logNumber] = true;

    Object.keys(calculatedLogs).forEach(logName => {
      const length = calculatedLogs[logName].length;

      if(logNumber < length){
        const logValues = calculatedLogs[logName][logNumber];

        // get the log value to calculate the average
        // to calculate average log value for each log
        if(!eachLogValue[logName]) eachLogValue[logName] = [];

        // to calculate points for each log
        if(!eachLogPoints[logName]) eachLogPoints[logName] = 0;

        // add values to the percentage and average
        if(logValues[2]){
          // add point
          eachLogPoints[logName]++;
          // add value to get avr
          eachLogValue[logName].push(logValues[1])
        }

        // calculating point for reservoir
        if(logValues[2] && logObject[logNumber]){
          logObject[logNumber] = logValues[2];
        } else{
          logObject[logNumber] = false;
        };
      };
    });
    if(logObject[logNumber]) totalReservoirPoints++;
  };

  console.log('Rpoint' , totalReservoirPoints);
  console.log('Gpoint' , totalGeosteeredPoints);


  const reservoirPercent = totalGeosteeredPoints?
  parseFloat(((totalReservoirPoints / totalGeosteeredPoints) * 100).toFixed(2)) : 0;

  const eachLogPercent = {};
  const eachLogAvr = {};

  Object.keys(eachLogPoints).forEach(logName=>{
    eachLogPercent[logName] = totalGeosteeredPoints?
    parseFloat(((eachLogPoints[logName] / totalGeosteeredPoints) * 100).toFixed(2)) : 0;

    eachLogAvr[logName] = parseFloat((eachLogValue[logName].reduce((acc, curr) => acc+curr,0) / eachLogValue[logName].length).toFixed(2));
  });

  // console.log(eachLogPoints);
  // console.log(eachLogPercent);
  // console.log(reservoirPercent);

  console.log('average for each', eachLogAvr);

  return [eachLogPercent, eachLogAvr, reservoirPercent];
};

// -------------------------------------

const getCalculatedData = (e, store) => {
  e.preventDefault();

  const {userCutoff, userTe } = store;
  const {wellName,  logsList, logsData} = store.fileData;


  const wellnameS = getWellName(wellName);

  const calculatedLogs = {};
  const ranges = {};
  let logsLength = 0;
  let logsTd = 0;

  logsList.forEach(logName => {
    const dataName = getDataName(wellnameS, logName);

    const cutoffValue = userCutoff[dataName];
    const logData = logsData[dataName];

    calculatedLogs[dataName] = calculateFootage(userTe, cutoffValue, logData);

    const calculatedLogsLength = calculatedLogs[dataName].length;

    const firstLog = calculatedLogs[dataName][0][0];
    const lastLog = calculatedLogs[dataName][calculatedLogsLength-1][0];

    if(lastLog < userTe ||lastLog === 0 ){
      // error out of range
      ranges[dataName] = 0;
    }else{
      ranges[dataName] = lastLog;
    };

    if(logsTd < lastLog){
      logsTd = lastLog;
      logsLength = calculatedLogs[dataName].length;
    };
  });

  const [eachLogPercent, eachLogAvr, reservoirPercent] = calculateSumLogs(logsLength, calculatedLogs);

  console.log('user|TE', userTe);
  console.log('user|cu', userCutoff);

  const TGF = Math.round(logsTd - userTe);

  const TRF = Math.round((TGF * reservoirPercent) / 100);

  const result = {};

  Object.assign(result, {wellName, TGF, TRF, TRC:reservoirPercent, eachLogPercent, eachLogAvr, ranges, calculatedLogs});

  updateStore({result});
};

// ============================================================================================

const darwFootageChart = (TGF, TRF) => {
  const data = [['TGF', TGF],['TRF', TRF]];

  const canv = chartElement.querySelector('.footage-chart');
  canv.classList.remove("canv-hide");
  const chartObjectc = chart(canv);

  chartObjectc.drawGrids(10,10);
  chartObjectc.drawAxis(4,2,23,11);
  chartObjectc.drawAxisValues(0,TGF+100,500);
  chartObjectc.drawBarChart(data);
};

const drawLogChart = (calculatedLogs) => {

};

const drawCharts = (store) =>{
  const {result} = store;

  const {TGF, TRF, calculatedLogs} = result;

  darwFootageChart(TGF, TRF);
  drawLogChart(calculatedLogs);
};

// ============================================================================================
// Event lesteners

const readFilesData = (files) =>{

  if(store.fileData&&store.result) updateStore({fileData:{}, result:{}});

  const fullData = {};

  let wellNameG = '';

  Object.keys(files).forEach(fileName => {
    const reader = new FileReader();

    const file = files[fileName];

    reader.onprogress = (e) =>{
      console.log(e.currentTarget);
    };

    reader.onload = (e) => {
      // console.log(reader.result.split('\n'))
      // let blob = new Blob(reader.result)

      const re = /\s(?: |$)\s/;
      const fileRows = reader.result.split('\n');

      // updateStore({fileRows});

      const fileData = getFileDataObject(fileRows);

      const wellName = getWellName(fileData['wellName']);

      if(wellNameG === '') wellNameG = wellName;

      if(wellNameG !== wellName) fileData['errors'].push('Your log files do not belong to the same well');

      if(fullData[wellName]){
        Object.keys(fileData['logsData']).forEach((logName)=>{
          if(fullData[wellNameG]['logsData'][logName]){
            fullData[wellNameG]['errors'].push(`You have more than one ${logName} in your files, Please provide one data set for each log.`);
          };
        });

        if(fullData[wellNameG]['depthRange'][0] > fileData['depthRange'][0]) fullData[wellNameG]['depthRange'][0] = fileData['depthRange'][0];
        if(fullData[wellNameG]['depthRange'][1] < fileData['depthRange'][1]) fullData[wellNameG]['depthRange'][1] = fileData['depthRange'][1];
        Object.assign(fullData[wellNameG]['logsData'], fileData['logsData']);
        Object.assign(fullData[wellNameG]['logsRanges'], fileData['logsRanges']);
        fullData[wellNameG]['logsList'] = fullData[wellNameG]['logsList'].concat(fileData['logsList']);
        fullData[wellNameG]['errors'] = fullData[wellNameG]['errors'].concat(fileData['errors']);


      }else{
        fullData[wellNameG] = fileData;
      };
      updateStore({fileData:fullData[wellNameG]});
    };

    reader.onerror = () =>{
      console.log(reader.error);
    };

    reader.readAsText(file);

  });

  console.log('full' ,fullData);

};

const testData =[["TGF",2254],['TRF',851]];


document.addEventListener("DOMContentLoaded", ({target})=>{
  render(root, store);
  // add listeners here
  document.addEventListener("click", (e)=> addEventsToButtons(e, store));
  document.addEventListener("change", (e)=> addEventsToOnChangeInputs(e, store));
  document.addEventListener("submit", (e)=> addEventsToSubmitButton(e, store));
  document.addEventListener("load", (e)=> addEventsToLoadedElements(e, store));
  chartElement = target;
});

const addEventsToLoadedElements = (e,store) => {

  if(target.matches(".footage-chart")){
    console.log(e.target);
  };
};
const addEventsToSubmitButton = (e, store) => {
  const {target} =e;
  if(target.matches("#user-input-form")){
    updateStore({userCutoff:currentCutoffs, userTe: currentTe});
    getCalculatedData(e, store);

    drawCharts(store);
  };
  if(target.matches(".footage-chart")){
    console.log(e.target);
  };

};

const addEventsToButtons = (e, store) => {
  const {target} =e;
};


const addEventsToFileReader = (files) => {
  const file = files[0];
  console.log(files);
  readFilesData(files);
};


const addEventsToCutoffInput = (target) => {

  const valueName = target.name.split('-');
  if(!currentCutoffs[valueName[1]]){
    Object.assign(currentCutoffs,{[valueName[1]]:{[valueName[0]]:parseFloat(target.value)}});
  };

    Object.assign(currentCutoffs[valueName[1]],{[valueName[0]]:parseFloat(target.value)});

};

const addEventsToTeInput = (target) => {
  currentTe = parseFloat(target.value);
};

const addEventsToOnChangeInputs = (e, store) => {
  const {target} = e;
  const {userCutoff} = store;
  if(target.matches("#file-data")){
    addEventsToFileReader(target.files);
  };

  if(target.matches(".cutoff-input")){
    addEventsToCutoffInput(target,userCutoff);
  };

  if(target.matches("#te-value")){
    addEventsToTeInput(target);
  };

};

// ================================================================
// chart

const drawGrids = (ctx, width, height, cellWidth, cellHeight, setChartOptions) => {
  ctx.beginPath();

  for(let nextXGrid = cellHeight; nextXGrid < height; nextXGrid+=cellHeight){
    ctx.moveTo(0, nextXGrid);
    ctx.lineTo(width, nextXGrid);
    ctx.strokeStyle = 'rgba(191,191,191,0.3)';
    ctx.stroke();
  };

  for(let nextYGrid = cellWidth ; nextYGrid < width ; nextYGrid+=cellWidth){
    ctx.moveTo(nextYGrid,0);
    ctx.lineTo(nextYGrid, height);
  };



  const moveToBlockX = blocksX(cellHeight);
  const moveToBlockY = blocksY(cellWidth);

  setChartOptions({cellHeight, cellWidth, moveToBlockX, moveToBlockY});
};
// =====
const blocksX = cellHeight => count => count*cellHeight;
const blocksY = cellWidth => count => count*cellWidth;
// =====
const drawAxis = (xBlockPos, yBlockPos, xAxLength, yAxLength, ctx, chartOptions, setChartOptions) => {
  const {moveToBlockX, moveToBlockY} = chartOptions;

  const xAxisLength = xBlockPos + xAxLength;
  const yAxisLength = yBlockPos + yAxLength;

  setChartOptions({xBlockPos, yBlockPos, xAxisLength, yAxisLength});

  ctx.beginPath();
  ctx.strokeStyle = 'black';
  ctx.moveTo(moveToBlockX(xBlockPos), moveToBlockY(yBlockPos));
  ctx.lineTo(moveToBlockX(xBlockPos), moveToBlockY(yAxisLength));
  ctx.lineTo(moveToBlockX(xAxisLength), moveToBlockY(yAxisLength));
  ctx.stroke();
};

const drawAxisValues = (minValue, maxValue, seperation, ctx, chartOptions, setChartOptions) => {
  const {xBlockPos, yBlockPos, xAxisLength, yAxisLength, moveToBlockX, moveToBlockY} = chartOptions;

  const plotNumbers = maxValue / seperation;

  const plotNumbersLength = (yAxisLength-yBlockPos)/plotNumbers;

  const blockValue = ((yAxisLength)-yBlockPos)/maxValue;

  ctx.moveTo(moveToBlockX(xBlockPos),moveToBlockY(yAxisLength));

  for(let i=0 ; i<plotNumbers+1 ; i++){
    const currentSeperation = i*seperation;

    ctx.strokeText(currentSeperation, moveToBlockX(xBlockPos-3), moveToBlockY(yAxisLength-plotNumbersLength*i));
  };

  ctx.stroke();
  setChartOptions({blockValue});
};

const drawLineChart = (data, ctx, chartOptions) => {
  const {xBlockPos, yBlockPos, xAxisLength, yAxisLength, moveToBlockX, moveToBlockY, blockValue} = chartOptions;

  const plotNumbersLength = (xAxisLength-xBlockPos)/data.length;

  ctx.beginPath();
  ctx.strokeStyle='black';
  ctx.moveTo(moveToBlockX(xBlockPos),moveToBlockY(yAxisLength));


  data.forEach((d,i)=>{
    const currentSeperation = (i + 1) * plotNumbersLength + xBlockPos - 1;

    const [title, value] = d;

    const valueInBlocks = value * blockValue;

    // ctx.strokeText(title, moveToBlockX(currentSeperation-1), moveToBlockY(yAxisLength+3));
    ctx.lineTo(moveToBlockX(currentSeperation), moveToBlockY(yAxisLength-valueInBlocks));
    // ctx.strokeText(value, moveToBlockX(currentSeperation-1), moveToBlockY(yAxisLength-valueInBlocks-1.5));
    // ctx.arc(moveToBlockX(currentSeperation), moveToBlockY(yAxisLength-valueInBlocks),2,0,Math.PI*2,true);
  });

  ctx.stroke();

};

const drawBarChart = (data, ctx, chartOptions) => {
  const {xBlockPos, yBlockPos, xAxisLength, yAxisLength, moveToBlockX, moveToBlockY, blockValue} = chartOptions;

  const plotNumbersLength = (xAxisLength-xBlockPos)/data.length;


  ctx.beginPath();
  ctx.strokeStyle='black';
  ctx.moveTo(moveToBlockX(xBlockPos),moveToBlockY(yAxisLength));

  data.forEach((d,i)=>{
    const currentSeperation = i===0?(i + 1) * plotNumbersLength + xBlockPos -6:(i + 1) * plotNumbersLength + xBlockPos -10;

    const [title, value] = d;

    const valueInBlocks = value * blockValue;
    console.log(valueInBlocks);
    const barPos = 6;

    i===0?ctx.fillStyle = 'red': ctx.fillStyle = 'green';

    const barValue = `${value} ft`;

    ctx.strokeText(title, moveToBlockX(currentSeperation +0.5), moveToBlockY(yAxisLength + 1.5));
    ctx.rect(moveToBlockX(currentSeperation), moveToBlockY(yAxisLength), 30, moveToBlockY(-valueInBlocks));
    ctx.fillRect(moveToBlockX(currentSeperation), moveToBlockY(yAxisLength), 30, moveToBlockY(-valueInBlocks));

    ctx.strokeText(barValue, moveToBlockX(currentSeperation+0.5), moveToBlockY(yAxisLength-valueInBlocks-1));
  })
  ctx.stroke();

};


const chart = (canvas) => {
  const ctx = canvas.getContext('2d');

  const chartOptions = {
    cellHeight: 10,
    cellWidth: 10,
    xBlockPos: 5,
    yBlockPos: 5,
    xAxisLength: 40,
    yAxisLength: 40
  };

  const getChartOptions = () => chartOptions;
  const setChartOptions = (option) => Object.assign(chartOptions, option);

  const width = canvas.width;
  const height = canvas.height;

  return {
    drawGrids: (cellWidth, cellHeight) => drawGrids(ctx, width, height, cellWidth, cellHeight, setChartOptions),
    drawAxis: (xBlockPos=5, yBlockPos=5, xAxLength=20, yAxLength=20) => drawAxis(xBlockPos, yBlockPos, xAxLength, yAxLength, ctx, getChartOptions(), setChartOptions),
    drawAxisValues: (minValue=0, maxValue=100, seperation=10) => drawAxisValues(minValue, maxValue, seperation, ctx, getChartOptions(), setChartOptions),
    drawLineChart: (data) => drawLineChart(data, ctx, getChartOptions()),
    drawBarChart: (data) => drawBarChart(data, ctx, getChartOptions())
  };
};