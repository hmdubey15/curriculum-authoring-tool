<div style="font-size: 17px;background: black;padding: 2rem;">

# Bullet Points

- Using `ChapterName_ID` as keys of objects. Content inside each chapter will nested similarly. Below is an example structure of state being used.

    ```js
    export const state = {
    "Limits and Continuity_1": {},
    "Integral Calculas_2": {
        "Area under curve_3": {},
        "Differential Equations_4": {
        "Degree_5": {},
        "Order_6": {},
        },
        "Indefinite Indegration_7": {
        "Trigonometric functions_8": {
            "Simple trigonometry_9": {},
            "Complex Trigonometry_10": {},
        },
        },
    },
    "Differentiation_11": {
        "Linear and non linear functions_12": {},
        "Application of Derivatives_13": { "Increasing Decreasing functions_14": {}, "Maxima and minima_15": {} },
    },
    };
    ```

- JSON Data downloaded will be in this format only because <b style="color:red;">there could be duplicate chapter names as well.</b>

- JSON Data to be loaded should be of similar format <b style="color:red;">if it has duplicate names.</b>

</div>