import axios from 'axios';
import { baseURL, apiKey, apiAppID, recipeURL } from '../config';

export default class Recipe {
	constructor(id) {
		this.id = id;
	}

	async getRecipe() {
		try {
			const recipeID = encodeURIComponent(`${recipeURL}${this.id}`)
            const results = await axios(`${baseURL}/search?r=${recipeID}&app_id=${apiAppID}&app_key=${apiKey}`);
            console.log(results);
            this.title = results.data[0].label;
            this.author = results.data[0].source;
            this.image = results.data[0].image;
            //this.url = results.data[0].url;
            this.url = results.data[0].shareAs;
            this.ingredients = results.data[0].ingredients;
		} catch (error) {
			console.log(error);
			alert('Something went wrong :(');
		}
	}

	calcTime() {
		//Assuming that we need 15 min for each 3 ingredients
		const numIng = this.ingredients.length;
		const periods = Math.ceil(numIng / 3);
		this.time = periods * 15;
	}

	calcServings() {
		this.servings = 4;
	}

    // Parse ingredients
    parseIngredients() {
        const newIngredients = this.ingredients.map((ingredient, index) => {
            let result = {
                food: ingredient.food,
                text: ingredient.text,
                description: ''
            };
 
            // Edit for plurals and language edge cases
            ingredient.measure = this.parseMeasurement(ingredient.quantity, ingredient.measure);
            // It's cooking, not chemistry
            ingredient.weight = ingredient.weight.toFixed(1); // Will eventually look to round this properly and remove the decimal when .0
 
            // Ideally use the quantity plus the unit of measurement, but if ingredient.measure is gram use ingredient.weight instead
            // If there's no unit of measurement but there is a quantity, use ingredient.quantity + ingredient.food 
            if(ingredient.quantity && ingredient.measure !== "gram"){
                // NB: a quantity of '1' with a <unit> type is usually suspect (1 black pepper, 1 milk chocolate etc), add gram weight + food type
                // 'Egg' is an exception
                if(ingredient.measure === "<unit>") {
                    result.description = (ingredient.quantity === 1 && ingredient.food.toLowerCase() !== 'egg')?  
                        `${ingredient.food} (${ingredient.weight}g)`:`${ingredient.quantity} ${ingredient.food} (${ingredient.weight}g)`;
                }
                // Else use quantity + the parsed unit
                else {
                    result.description = `${ingredient.quantity} ${ingredient.measure} of ${ingredient.food}`;
                }
            } 
            // If there's no quantity or weight, use 'to taste'
            else if(!ingredient.quantity && !ingredient.weight){
                result.description = `to taste`
            } 
            // Else just use the gram weight
            else {
                result.description = `${ingredient.food} (${ingredient.weight}g)`
            }
            return result;
        });
 		console.log(newIngredients);
        this.parsedIngredients = newIngredients;
    }
 
    parseMeasurement(quantity, measurement){
        // Ignore <unit> as a measurement
        if(measurement === '<unit>') return measurement;
        // If the quantity is not exactly one, make the measurement plural
        else if(quantity !== 1) {
            // Add unusual cases here
            switch(measurement) {
                case 'leaf': return 'leaves';
                default: return `${measurement}s`;
            }
        } else {
            return measurement;
        }
    }
}