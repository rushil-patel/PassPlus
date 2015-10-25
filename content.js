//content.js

//listen for message from background script(s)
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {
      var firstHref = $("a[href^='http']").eq(0).attr("href");

      console.log(firstHref);

      //send message to background script(s)
      chrome.runtime.sendMessage({"message": "open_new_tab", "url": firstHref});
    }
  }
);

var dataDict = {};


var xhr = new XMLHttpRequest();
xhr.open("GET", "http://polyratings.com/list.phtml", true);
xhr.onreadystatechange = function() {
	if (xhr.readyState == 4 && xhr.status == 200) {
		//console.log(xhr.responseText);
		
		idDict = getData(xhr.responseText);
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

				dict.ids[a.innerText] = id;
				dict.scores[a.innerText] = tds[3].value;
			}
		}
	}
	return dict;
} 

function getScore(prof){

}

$(document).ready(function() {
	var trs = $('div.content  table tbody tr');
	var headerPRNode = document.createTextNode("PolyRatings Score");

	var tableHeaderPR = $('div.content table thead tr')[0].insertCell(5);
		tableHeaderPR.setAttribute("style", "font-weight: bold");	
		tableHeaderPR.appendChild(headerPRNode);
	
	for(var tr = 0; tr < trs.length; tr++){

		if(trs[tr].children.length > 2) {
			if(trs[tr].children.length == 14) {
				var teach = trs[tr].insertCell(4);
			}
			else {
				var teach = trs[tr].insertCell(5); 
			}
			console.log(trs[tr]);
		}
	}
});


