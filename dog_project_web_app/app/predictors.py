import cv2
import numpy as np
import json

from keras.models import load_model


from tensorflow.keras.applications.resnet50 import (
    ResNet50,
    preprocess_input,
)
from tensorflow.keras.preprocessing import image

# define ResNet50 model
ResNet50_model = ResNet50(weights="imagenet")

resnet50_trained_model = load_model(
    "./dog_project_web_app/models/resnet50.model.best.h5"
)

bottleneck_feature = ResNet50(
    weights="imagenet", include_top=False, pooling="avg"
)


def human_predictor(img_path):
    """
    INPUT
    img_path (string) - path to the uploaded image

    OUTPUT
    is_human (bool) - is humad detected
    """
    face_cascade = cv2.CascadeClassifier(
        "./dog_project_web_app/app/haarcascades/haarcascade_frontalface_alt.xml"
    )
    img = cv2.imread(img_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray)
    return len(faces) > 0


def path_to_tensor(img_path):
    # loads RGB image as PIL.Image.Image type
    img = image.load_img(img_path, target_size=(224, 224))
    # convert PIL.Image.Image type to 3D tensor with shape (224, 224, 3)
    x = image.img_to_array(img)
    # convert 3D tensor to 4D tensor with shape (1, 224, 224, 3) and return
    # 4D tensor
    return np.expand_dims(x, axis=0)


def dog_predictor(img_path):
    """
    INPUT
    img_path (string) - path to the uploaded image

    OUTPUT
    is_dog (bool) - is dog detected
    """

    def ResNet50_predict_labels(img_path):
        # returns prediction vector for image located at img_path
        img = preprocess_input(path_to_tensor(img_path))
        return np.argmax(ResNet50_model.predict(img))

    prediction = ResNet50_predict_labels(img_path)
    return bool((prediction <= 268) & (prediction >= 151))


def get_dog_names():
    # for reading also binary mode is important
    with open("./data/dogNames.json", "rb") as fp:
        n_list = json.load(fp)
        return n_list


def dog_breed_predictor(img_path):
    """
    INPUT
    img_path (string) - path to the uploaded image

    OUTPUT
    dog_beed_names (list) - list of top 4 breed names
    dog_breed_probabilities (list) - list of top 4 breed probabilities
    """

    # extract bottleneck features
    # bottleneck_feature = extract_Resnet50(path_to_tensor(img_path))
    bottleneck_feature_p = bottleneck_feature.predict(
        preprocess_input(path_to_tensor(img_path)), verbose=1
    )
    bottleneck_feature_p = np.expand_dims(bottleneck_feature_p, axis=0)
    bottleneck_feature_p = np.expand_dims(bottleneck_feature_p, axis=0)

    # # obtain predicted vector
    predicted_vector = resnet50_trained_model.predict(bottleneck_feature_p)

    # # return top 4 dog breeds that is predicted by the model
    predicted_vector = np.squeeze(predicted_vector)
    ind = np.argpartition(predicted_vector, -4)[-4:]
    ind = ind[np.argsort(predicted_vector[ind])][::-1]
    dog_names = get_dog_names()

    return list(np.array(dog_names)[ind]), list(
        predicted_vector[ind].astype("str")
    )
