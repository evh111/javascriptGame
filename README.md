# This entire game is intented to be loaded through a CDN via the following links:

# Link to CSS: https://cdn.jsdelivr.net/gh/evh111/javascriptGame/styles.css
# Link to Javascript: https://cdn.jsdelivr.net/gh/evh111/javascriptGame/scripts.js

# Below is an example use case, and illustrates a situation where the user clicks a button to launch the game.

# Javascript snippet:
document.getElementById('clearHTMLBtn').addEventListener('click', function() {
	
	// Replace the contents of the webpage.
	document.head.innerHTML = '';
	document.body.innerHTML = '';
	document.querySelectorAll('style,link[rel="stylesheet"]').forEach(item => item.remove());
	
	// Load in the CDN's.
	var gameScript = document.createElement('script');  
	gameScript.setAttribute('src', 'https://cdn.jsdelivr.net/gh/evh111/javascriptGame/scripts.js');
	
	var jqueryScript = document.createElement('script');  
	jqueryScript.setAttribute('src', 'https://code.jquery.com/jquery-3.5.1.min.js');
	
	document.head.innerHTML += '<link href="https://fonts.googleapis.com/css2?family=Gugi&display=swap" rel="stylesheet" />';
	document.head.innerHTML += '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/evh111/javascriptGame/styles.css" />';
	document.head.appendChild(gameScript);
	document.head.appendChild(jqueryScript);
	
});
