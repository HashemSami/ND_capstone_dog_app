## Project Overview:

This project is for the Udacity's Data Scientist Nanodegree, to build Convolutional Neural Networks (CNNs). Given an image of a dog, the algorithm will identify an estimate of the canine’s breed. If supplied an image of a human, the code will identify the resembling dog breed.

## Motivation:

This project will make the first steps towards developing an algorithm that could be used as part of a mobile or web app. Where the code will accept any user-supplied image as input. If a dog is detected in the image, it will provide an estimate of the dog's breed. If a human is detected, it will provide an estimate of the dog breed that is most resembling. The image below displays potential sample output of your finished project.

[image1]: ./dog-project_model_building/images/sample_dog_output.png "Sample Output"

![Sample Output][image1]

## Project Structure:

The project is divided into two sections, you can run each section separately by following the instructions the belongs to the part you choose to run.

### Part1:

Testing code and walkthrough to the model building process and the pipeline creation.
All the code needed found inside the `dog-project_model_building` folder.

### Part1 Instructions:

1. Clone the repository and navigate to the downloaded folder.

```
git clone https://github.com/udacity/dog-project.git
cd dog-project
```

2. Install the required libraries by executing this command in the project's root directory:

```
pip install -r requirements.txt
```

2. Download the [dog dataset](https://s3-us-west-1.amazonaws.com/udacity-aind/dog-project/dogImages.zip). Unzip the folder and place it in the repo, at location `path/to/ND_capstone_dog_app/data/dogImages`.

3. Download the [human dataset](https://s3-us-west-1.amazonaws.com/udacity-aind/dog-project/lfw.zip). Unzip the folder and place it in the repo, at location `path/to/ND_capstone_dog_app/data/lfw`. If you are using a Windows machine, you are encouraged to use [7zip](http://www.7-zip.org/) to extract the folder.

4. Download the [VGG-16 bottleneck features](https://s3-us-west-1.amazonaws.com/udacity-aind/dog-project/DogVGG16Data.npz) for the dog dataset. Place it in the repo, at location `path/to/ND_capstone_dog_app/dog-project_model_building/bottleneck_features`.

5. Download the [Resnet50 bottleneck features](https://s3-us-west-1.amazonaws.com/udacity-aind/dog-project/DogResnet50Data.npz) for the dog dataset. Place it in the repo, at location `path/to/ND_capstone_dog_app/dog-project_model_building/bottleneck_features`.

6. (Optional) **If you plan to install TensorFlow with GPU support on your local machine**, follow [the guide](https://www.tensorflow.org/install/) to install the necessary NVIDIA software on your system. If you are using an EC2 GPU instance, you can skip this step.

### Part2:

This part contains a pipeline script that will train a CNN model based on the provided images datasets and saves the best trained model.
It also contains a web application code that will run on a Flask server, that utilizes the trained model to make predictions on the app user’s input images.
All the code needed found inside the `dog_project_web_app` folder.

### Part1 Instructions:

1. Clone the repository and navigate to the downloaded folder.

```
git clone https://github.com/udacity/dog-project.git
cd dog-project
```

2. Install the required libraries by executing this command in the project's root directory:

```
pip install -r requirements.txt
```

2. Download the [dog dataset](https://s3-us-west-1.amazonaws.com/udacity-aind/dog-project/dogImages.zip). Unzip the folder and place it in the repo, at location `path/to/ND_capstone_dog_app/data/dogImages`.

3. Download the [human dataset](https://s3-us-west-1.amazonaws.com/udacity-aind/dog-project/lfw.zip). Unzip the folder and place it in the repo, at location `path/to/ND_capstone_dog_app/data/lfw`. If you are using a Windows machine, you are encouraged to use [7zip](http://www.7-zip.org/) to extract the folder.

4. Run the following commands in the project's root directory to set up your trained model.
   `python dog_project_web_app/models/train_classifier.py`

5. Run the following command in the project's root directory to run your web app.
   `python python dog_project_web_app/app/run.py`

6. Go to http://0.0.0.0:3001/

7. (Optional) **If you plan to install TensorFlow with GPU support on your local machine**, follow [the guide](https://www.tensorflow.org/install/) to install the necessary NVIDIA software on your system. If you are using an EC2 GPU instance, you can skip this step.

### Files structure:

```bash
├── requirments.txt
├── README.md - This file.
├── data - # data file that you will need to download the dataset into.
│
├── dog-project_model_building - # PART1.
│   ├── dog_app.ipynb # contains all the code testing and building the models
│   ├── dog_app.html # HTML file of the generated code cells
│   ├── extract_bottleneck_features.py # functions to extract features from pre-trained models
│   ├── images # testing images
│   ├── bottleneck_features # a folder for storing the bottleneck_features of a pre-trained models that will be used to build the dog breed classifier model
│   └── haarcascades
│       └── haarcascade_frontalface_alt.xml # xml structure for detecting human features that will be used with cv2 library
│
└── dog_project_web_app - # PART2.
    ├── app
    │   ├── template
    │   │   └── master.html # main page of web app
    │   ├── static
    │   │   ├── css # styling files for the HTML pages
    │   │   └── js # Javascript files for the HTML pages
    │   ├── predictors.py # functions the uses the trained models for predictions
    │   └── run.py # Flask file that runs app
    └── models
        ├── train_classifier.py # script that will train a CNN model, test its accuracy, and save the model inside the folder
        ├── resnet50.weights.best.dhf5 # saves model's best weights
        └── resnet50.model.best.h5 # saved model
```
