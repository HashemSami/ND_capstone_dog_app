import { sendFile } from "./sendFile.js";

const readFilesData = (files, store, updateStore) => {
  if (store.fileData && store.result) updateStore({ fileData: {}, result: {} });

  Object.keys(files).forEach(fileName => {
    const reader = new FileReader();

    const file = files[fileName];
    reader.readAsDataURL(file);

    reader.onprogress = e => {
      console.log(e.currentTarget);
    };

    reader.onloadend = async e => {
      const imageBlob = new Blob([file], { type: "image/bmp" });

      updateStore({ loading: "Predicting Image...", result: {} });

      const data = await sendFile(imageBlob);

      updateStore({ fileData: imageBlob, result: data, loading: "" });
    };

    reader.onerror = () => {
      console.log(reader.error);
    };
  });

  // console.log("full", fullData);
};

export { readFilesData };
