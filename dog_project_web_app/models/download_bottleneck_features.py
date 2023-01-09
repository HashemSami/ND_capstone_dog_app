import requests


def download_features():
    url = "https://s3-us-west-1.amazonaws.com/udacity-aind/dog-project/DogResnet50Data.npz"
    r = requests.get(url, allow_redirects=True)
    open("./dog_project_web_app/models/DogResnet50Data.npz", "wb").write(
        r.content
    )


download_features()
