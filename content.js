//Rushil Patel
//content.js

var dataDict = {};


var xhr = new XMLHttpRequest();
xhr.open("GET", "http://polyratings.com/list.phtml", true);
xhr.onreadystatechange = function() {
	if (xhr.readyState == 4 && xhr.status == 200) {
		
		dataDict = getData(xhr.responseText);
		injectScores();
	}
};
xhr.send();


function getData(text) {
	parser = new DOMParser();
	var document = parser.parseFromString(text, "text/html");
	var tds;
	var regID = /profid=([^&]*)/;
	var dict = { 
		ids: {},
		scores: {}
	};

	trs = document.getElementsByTagName("tbody")[1].getElementsByTagName("tr");

	for(entry in trs) {
		if (tds = trs[entry].children) {
			
			var a;
			if(a = tds[0].getElementsByTagName('a')[0]) {
				var id = regID.exec(a.getAttribute('href'))[1];
				var profName = a.innerText;

				dict.ids[profName] = id;
				dict.scores[profName] = tds[3].innerText;
			}
		}
	}
	return dict;
} 

//format professor names to match Pass names with PolyRating names
function formatProfName(prof) {

	var names = prof.split(/,| /);
	prof = names[0] + ", " + names[1];
	return prof;
}

//some professor names are backwards (first, last) on polyratings
function reverseProfName(prof) {
	var names = prof.split(/,| /);
	prof = names[2] + ", " + names[0];
	return prof;
}

function partialMatch(prof) {
	var names = prof.split(/,| /);
	var score;
	var trim = names[2].length - 1;
	while(trim > 0 && score === undefined) {
		var partialName = names[0] +", "+ names[2].substring(0,trim);
		console.log(partialName);
		score = dataDict.scores[partialName];
		trim--;
	}
	return partialName;

}

function getLink(prof) {
	var id = dataDict.ids[prof];

	if (id === undefined) {
		var reverseName = reverseProfName(prof);
		id = dataDict.ids[reverseName];
	}
	if (id === undefined) {
		var partialName = partialMatch(prof);
		id = dataDict.scores[partialName];
	}

	return "http://polyratings.com/eval.phtml?profid=" + id;
}

function getScore(prof) {

	var score = dataDict.scores[prof];

	if (score === undefined) {
		var reverseName = reverseProfName(prof);
		score = dataDict.scores[reverseName];
	}
	console.log(score);
	if (score === undefined) {
		var partialName = partialMatch(prof);
		score = dataDict.scores[partialName];
	}
	return score;
}

function injectHeaderColumns() {
	var ths = $('div.select-course table thead tr');
	var thNode;
	var thCell;

	for(var th = 0; th < ths.length; th++){

		thNode = document.createTextNode("PolyRatings Score");
		thCell = ths[th].insertCell(5);
		thCell.setAttribute("style", "font-weight: bold");	
		thCell.appendChild(thNode);
	}
}

function scoreToColor(score) {
	var factor = (score >= 3.8) ? 0.13 : (score < 3.0) ? 0.08 : 0.1;

	var H = score * factor;
	var S = 0.9;
	var B = 0.9;

	var color = HSVtoRGB(H, S, B);

	return "rgb(" + color.r +","+ color.g +","+ color.b +")";
}

function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function injectScores() {

	injectHeaderColumns();

	var trs = $('div.select-course > table tbody tr');
	var prNode;
	var prValue;
	var prof;
	
	for(var tr = 0; tr < trs.length; tr++){

		if(trs[tr].children.length > 2) {

			if(trs[tr].children.length == 14) {	

				prof = formatProfName(trs[tr].children[3].innerText);
				prCell = trs[tr].insertCell(4);
			}
			else {
				prof = formatProfName(trs[tr].children[4].innerText);
				prCell = trs[tr].insertCell(5);

			}

			
			prValue = getScore(prof);

			if(prValue !== undefined) {

				prNode = document.createElement('a');
				prNode.innerText = (prValue);
				prNode.setAttribute("href", getLink(prof));
				prNode.setAttribute("target", "_blank");
				prNode.setAttribute("style", "text-align: center; display: block; background-color:"+ scoreToColor(prValue));

			} else {
				prNode = document.createTextNode("----");
				prCell.setAttribute("style", "text-align: center");
			}

			prCell.appendChild(prNode);


		}
	}
}


