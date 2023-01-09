from flask import Flask
from flask import render_template, request, jsonify
from predictors import human_predictor, dog_predictor, dog_breed_predictor
from werkzeug.utils import secure_filename

from os import path


app = Flask(__name__)


# index webpage that receives user input image for model
@app.route("/")
@app.route("/index")
def index():

    # render web page with plotly graphs
    return render_template("master.html")


# handles user data and displays model results
@app.route("/processImage", methods=["POST"])
def processImage():
    try:

        # check if the post request has the file part
        if "image" in request.files:

            file = request.files["image"]
            filename = path.join(
                "./dog_project_web_app/app", secure_filename(file.filename)
            )
            file.save(filename)

            is_human = human_predictor(filename)
            is_dog = dog_predictor(filename)

            dog_breeds, dog_breeds_p = ["none"], ["none"]

            if is_human or is_dog:
                dog_breeds, dog_breeds_p = dog_breed_predictor(filename)

            data = {
                "human": is_human,
                "dog": is_dog,
                "breed_names": dog_breeds,
                "breed_p": dog_breeds_p,
            }

            return jsonify(data)

        return jsonify(data={"error": "Image Is not recognized"})
    except Exception as err:
        print(err)


def main():
    app.run(host="0.0.0.0", port=3001, debug=True)


if __name__ == "__main__":
    main()
