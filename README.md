## This entire game is intented to be loaded through a CDN via the following links:

Link to CSS: https://cdn.jsdelivr.net/gh/evh111/javascriptGame/styles.css \
Link to Javascript: https://cdn.jsdelivr.net/gh/evh111/javascriptGame/scripts.js

## To host a customized version of this game: 

1. Clone this repo and adjust the CDN links to reflect your own instance.
2. In order to adjust the theme, perform a Ctrl+F/Cmd+F and search for the word "Customize" in both the "styles.css" and "scripts.js" files.

Below is an example use case, and illustrates a situation where the user clicks a button to launch the game.
```
document.getElementById('button').addEventListener('click', function() {
	
	// Replace the contents of the webpage.
	document.head.innerHTML = '';
	document.body.innerHTML = '';
	document.querySelectorAll('style,link[rel="stylesheet"]').forEach(item => item.remove());
	
	// Load in CDN's.
	var jqueryScript = document.createElement('script');  
	jqueryScript.setAttribute('src', 'https://code.jquery.com/jquery-3.5.1.min.js');
	
	var gameScript = document.createElement('script');  
	gameScript.setAttribute('src', 'https://cdn.jsdelivr.net/gh/evh111/javascriptGame/scripts.js');
	
	document.head.innerHTML += '<link href="https://fonts.googleapis.com/css2?family=Gugi&display=swap" rel="stylesheet" />';
	document.head.innerHTML += '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/evh111/javascriptGame/styles.css" />';
	document.head.appendChild(jqueryScript);
	document.head.appendChild(gameScript);
	
});
```
