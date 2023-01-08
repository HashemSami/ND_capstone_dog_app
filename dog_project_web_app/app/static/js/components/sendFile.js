const sendFile = async image => {
  const myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  // myHeaders.append("Authorization", "Bearer eyJ0eXAiOiJKV1QiLCJh");

  const formdata = new FormData();
  formdata.append("image", image, "image.jpeg");

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: formdata,
    redirect: "follow",
  };

  console.log(image);
  const response = await fetch(
    "http://localhost:3001/processImage",
    requestOptions
  );

  const data = await response.json();

  console.log(data);
  return data;
};

export { sendFile };
