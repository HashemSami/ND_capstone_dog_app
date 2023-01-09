from keras.utils import np_utils
from keras.layers import GlobalAveragePooling2D
from keras.layers import Dense
from keras.models import Sequential
from keras.callbacks import ModelCheckpoint
from keras.callbacks import ReduceLROnPlateau
from keras.models import save_model
from sklearn.datasets import load_files

from glob import glob

import json
from os import path

import numpy as np

from download_bottleneck_features import download_features


def load_data():
    """
    INPUT
    none

    OUTPUT
    train_resnet50, train_targets (tuple) -  (numpy array, numpy array)
    valid_resnet50, valid_targets (tuple) - (numpy array, numpy array)
    test_resnet50, test_targets (tuple) - (numpy array, numpy array)

    This function loads images paths and targets from the data source
    and get X and Y data required for ML.
    """

    def load_dataset(path):
        data = load_files(path)
        dog_files = np.array(data["filenames"])
        dog_targets = np_utils.to_categorical(np.array(data["target"]), 133)
        return dog_files, dog_targets

    # load train, test, and validation datasets
    train_files, train_targets = load_dataset("./data/dogImages/train")
    valid_files, valid_targets = load_dataset("./data/dogImages/valid")
    test_files, test_targets = load_dataset("./data/dogImages/test")

    # Obtain bottleneck features from another pre-trained CNN.
    bottleneck_features = np.load(
        "./dog_project_web_app/models/DogResnet50Data.npz"
    )
    train_resnet50 = bottleneck_features["train"]
    valid_resnet50 = bottleneck_features["valid"]
    test_resnet50 = bottleneck_features["test"]

    # load list of dog names
    dog_names = [
        item[27:-1] for item in sorted(glob("./data/dogImages/train/*/"))
    ]

    # save dog names into a file for the app
    with open("./data/dogNames.json", "w") as fp:
        json.dump(dog_names, fp)

    # print statistics about the dataset
    print("There are %d total dog categories." % len(dog_names))
    print(
        "There are %s total dog images.\n"
        % len(np.hstack([train_files, valid_files, test_files]))
    )
    print("There are %d training dog images." % len(train_files))
    print("There are %d validation dog images." % len(valid_files))
    print("There are %d test dog images." % len(test_files))

    return (
        (train_resnet50, train_targets),
        (valid_resnet50, valid_targets),
        (test_resnet50, test_targets),
    )


def build_model():
    """
    INPUT
    none

    OUTPUT
    model (object) - model

    This function creates the model that can be plugged to a pre trained
    Resnet50 model and use its features
    """
    model = Sequential()
    model.add(GlobalAveragePooling2D(input_shape=(1, 1, 2048)))

    model.add(Dense(133, activation="softmax"))
    model.summary()

    model.compile(
        loss="categorical_crossentropy",
        optimizer="adam",
        metrics=["accuracy"],
    )

    return model


def train_model(
    resnet50_model,
    train_resnet50,
    train_targets,
    valid_resnet50,
    valid_targets,
):
    """
    INPUT
    resnet50_model (object) - model
    train_resnet50 (numpy array) - pre trained Resnet50 model training features
    train_targets (numpy array) - training data targets
    valid_resnet50 (numpy array) - pre trained Resnet50 model training features
    valid_targets (numpy array) - validation data targets

    OUTPUT
    model (object) - model

    This function trains the model using the provided data and saves the best
    model in "resnet50.weights.best.hdf5" file
    """
    checkpointer = ModelCheckpoint(
        filepath="./dog_project_web_app/models/resnet50.weights.best.hdf5",
        verbose=1,
        save_best_only=True,
    )

    reduce_lr = ReduceLROnPlateau(
        monitor="loss",
        factor=0.1,
        patience=3,
        verbose=1,
        min_delta=5 * 1e-3,
        min_lr=5 * 1e-9,
    )

    callbacks = [checkpointer, reduce_lr]

    resnet50_model.fit(
        train_resnet50,
        train_targets,
        epochs=40,
        validation_data=(valid_resnet50, valid_targets),
        callbacks=callbacks,
        verbose=1,
        shuffle=True,
    )


def evaluate_model(resnet50_model, test_resnet50, test_targets):
    """
    INPUT
    resnet50_model (object) - model
    test_resnet50 (numpy array) - pre trained Resnet50 model testing features
    test_targets (numpy array) - testing data targets

    OUTPUT
    model (object) - void

    This function evaluates the best trained model using the provided test data
    and prints the accurace results to the console
    """
    # Load the model weights with the best validation loss.
    resnet50_model.load_weights(
        "./dog_project_web_app/models/resnet50.weights.best.hdf5"
    )
    # get index of predicted dog breed for each image in test set
    resnet50_predictions = [
        np.argmax(resnet50_model.predict(np.expand_dims(feature, axis=0)))
        for feature in test_resnet50
    ]

    # report test accuracy
    test_accuracy = (
        100
        * np.sum(
            np.array(resnet50_predictions) == np.argmax(test_targets, axis=1)
        )
        / len(resnet50_predictions)
    )

    print("\nTest accuracy: %.4f%%" % test_accuracy)


def save_best_model(resnet50_model):
    resnet50_model.load_weights(
        "./dog_project_web_app/models/resnet50.weights.best.hdf5"
    )
    save_model(
        resnet50_model,
        "./dog_project_web_app/models/resnet50.model.best.h5",
        include_optimizer=False,
    )


def main():
    if not path.exists("./dog_project_web_app/models/DogResnet50Data.npz"):
        print("Downloading bottleneck features...")
        download_features()

    print("Loading data...")
    (
        (train_resnet50, train_targets),
        (valid_resnet50, valid_targets),
        (test_resnet50, test_targets),
    ) = load_data()

    print("Building model...")
    model = build_model()

    print("Training model...")
    train_model(
        model, train_resnet50, train_targets, valid_resnet50, valid_targets
    )

    print("Evaluating model...")
    evaluate_model(model, test_resnet50, test_targets)

    save_best_model(model)
    print("Trained model saved!")


if __name__ == "__main__":
    main()
