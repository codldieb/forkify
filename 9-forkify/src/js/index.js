import Search from './models/Search';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import {elements, renderLoader, clearLoader} from './views/base';
import Recipe from './models/Recipe';

/** Global state of the app
|* - Search object
|* - Current recipe object
|* - Shopping list object
|* - Liked recipes
|*/
const state = {};

const controlSearch = async () => {
	// 1. Get query from view
	const query = 'pizza'; //searchView.getInput();

	if (query) {
		// 2. New search object and add to state
		state.search = new Search(query);

		// 3. Prepare UI for results
		searchView.clearInput();
		searchView.clearResults();
		renderLoader(elements.searchResults);

		try {
			// 4. Search for recipes
			await state.search.getResults();
	
			// 5. Render results on UI
			clearLoader();
			searchView.renderResults(state.search.recipes);
		} catch (error) {
			alert('Something wrong with the search...');
			clearLoader();
		}
		
	}
}


elements.searchForm.addEventListener('submit', e => {
	e.preventDefault();
	controlSearch();
});

//TESTING
window.addEventListener('load', e => {
	e.preventDefault();
	controlSearch();
});

elements.searchResults.addEventListener('click', e => {
	const btn = e.target.closest('.btn-inline');
	if (btn) {
		const goToPage = parseInt(btn.dataset.goto, 10);
		searchView.clearResults();
		searchView.renderResults(state.search.recipes, goToPage);
	}
});


/**
|* RECIPE CONTROLLER
|*/

const controlRecipe = async () => {
	// Get ID from url
	const id = window.location.hash.replace('#', '');

	if (id) {
		//Prepare UI for changes
		renderLoader(elements.recipe);

		//Create new recipe object
		state.recipe = new Recipe(id);
		// TESTING
		window.r = state.recipe;

		try {
			//Get recipe data
			await state.recipe.getRecipe();
			//Calculate servings and time
			state.recipe.calcTime();
			state.recipe.calcServings();
	
			//Render recipe
			clearLoader();
			recipeView.renderRecipe(state.recipe);
		} catch (err) {
			alert('Error processing recipe!');
		}
	}
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));