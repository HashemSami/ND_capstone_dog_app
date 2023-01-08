const renderResults = (image, result) => {
  const { breed_names, breed_p, dog, human } = result;
  // console.log(result);
  const type = dog
    ? "Hello <span>Dog</span>"
    : human
    ? "Hello <span>Human</span>"
    : "Please provide an image of a dog or human";

  const breedNamesCleaned = breed_names.map(
    b =>
      `<a href=${`https://en.wikipedia.org/wiki/${b}`} target="_blank">${b.replace(
        /_/g,
        " "
      )}</a>`
  );
  const breedPCleaned = breed_p.map(b => parseFloat(b));

  const renderBreed = () => {
    if (!(dog || human)) return "";

    const breed =
      breedPCleaned[0] > 0.5
        ? `I'm sure your breed is ${breedNamesCleaned[0]}.`
        : `Your breed might be ${breedNamesCleaned[0]} or ${breedNamesCleaned[1]}.`;

    return breed;
  };

  return `

  <div class='result-values'>
    <div class='values-card'>
      <h2>${type} </h2>
      <h3>${renderBreed()}</h3>
    </div>
  </div>
  <div class='result-log-charts'>
      <image  src=${URL.createObjectURL(
        image
      )} alt="Your image" width="100%" height="500"/>
  </div>
  `;
};

export { renderResults };
