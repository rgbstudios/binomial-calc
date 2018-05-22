
/*
v.1.0.0 5-20
todo
fix overflow, roudning, efficiency problems for very large input
add history and share
make table more mobile friendly
use realfavicongenerator.net

https://stackoverflow.com/questions/9870512/how-to-obtain-the-query-string-from-the-current-url-with-javascript?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
use url to map queries to input
when webpage loads, fill input with url
when calculate, change url to input
*/

function nchoosek(n,k){
  let result = 1;
  for(let i = 1; i <= k; i++){
    result *= (n+1-i)/i;
  }
  return result;
}

function equal(p,n,x) {
  return nchoosek(n,x) * Math.pow(p,x) * Math.pow(1-p,n-x);
}
function less(p,n,x) {
  let result = 0;
  for(let i=0; i<x; i++) {
    result += equal(p,n,i);
  }
  return result;
}
function greater(p,n,x) {
  let result = 0;
  for(let i=n; i>x; i--) {
    result += equal(p,n,i);
  }
  return result;
}

function mean(p,n,x) {
  return n*p;
}
function variance(p,n,x) {
  return n * p * (1-p);
}
function stddev(p,n,x) {
  return Math.sqrt(variance(p,n,x));
}

function round(num, digits) {
  return (Math.round(num*Math.pow(10,digits) ) / Math.pow(10,digits) );
}

document.onkeyup = function(e) {
  let code = e.keyCode ? e.keyCode : e.which;
  if(code == 13){ //enter
    calc();
  }
  else if(code == 73) { //"i"
    document.getElementById('infoModalButton').click();
  }
  else if(code == 78) { //"n"
    document.getElementById('nightButton').click(); 
  }
}

function clear() {
  document.getElementById("pInput").value = '';
  document.getElementById("nInput").value = '';
  document.getElementById("xInput").value = '';
  console.log('Cleared');
}

//https://stackoverflow.com/questions/3900701/onclick-go-full-screen?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
function toggleFullscreen() {
  if ((document.fullScreenElement && document.fullScreenElement !== null) ||    
   (!document.mozFullScreen && !document.webkitIsFullScreen)) {
    if (document.documentElement.requestFullScreen) {  
      document.documentElement.requestFullScreen();  
    } else if (document.documentElement.mozRequestFullScreen) {  
      document.documentElement.mozRequestFullScreen();  
    } else if (document.documentElement.webkitRequestFullScreen) {  
      document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);  
    }  
  } else {  
    if (document.cancelFullScreen) {  
      document.cancelFullScreen();  
    } else if (document.mozCancelFullScreen) {  
      document.mozCancelFullScreen();  
    } else if (document.webkitCancelFullScreen) {  
      document.webkitCancelFullScreen();  
    }  
  }  
}

function calc() {
  let p = parseFloat(document.getElementById("pInput").value);
  let n = parseInt(document.getElementById("nInput").value);
  let x = parseInt(document.getElementById("xInput").value);

  history.replaceState({}, "", "?p=" + p + "&n=" + n + "&x=" + x);

  console.log("Calculating... Inputs: " + p + ", " + n + ", " + x);

  let errorP = document.getElementById("errorP");
  let errorAlert = document.getElementById("errorAlert");

  errorP.innerHTML = "";
  errorAlert.style.display = "none";

  if(isNaN(p) || isNaN(n) || isNaN(x) ) {
    errorP.innerHTML = "p, n, and x must be numbers";
    errorAlert.style.display = "block";
    return;   
  }
  if(p > 1 || p < 0) {
    errorP.innerHTML = "p must be between 0 and 1";
    errorAlert.style.display = "block";
    return;
  }
  if(n < 0 || x < 0) {
    errorP.innerHTML = "n and x must be positive integers";
    errorAlert.style.display = "block";
    return;
  }
  if(n >= 1000 || x >= 1000) {
    errorP.innerHTML = "n and x must be less than 1000";
    errorAlert.style.display = "block";
    return;
  }
  if(n < x) {
    errorP.innerHTML = "n must be &ge; x";
    errorAlert.style.display = "block";
    return;
  }

  //display results
  document.getElementById("chooseOutput").value = Math.round(nchoosek(n, x));
  document.getElementById("equalOutput").value = round(equal(p, n, x),10);
  document.getElementById("lessOutput").value = round(less(p, n, x),10);
  document.getElementById("greaterOutput").value = round(greater(p, n, x),10);
  document.getElementById("lessEqualOutput").value = round(equal(p, n, x) + less(p, n, x),10);
  document.getElementById("greaterEqualOutput").value = round(equal(p, n, x) + greater(p, n, x),10);
  document.getElementById("infoP").innerHTML = "Mean: " + round(mean(p, n, x),10) + "<br>Variance: " + round(variance(p, n, x),10) + "<br>  Std Dev: " + round(stddev(p, n, x),10);

  //google charts
  google.charts.load('current', {'packages':['corechart','bar']});
  google.charts.setOnLoadCallback(drawChart);

  function drawChart() {
    //pie
    let data = google.visualization.arrayToDataTable([
      ['Set', 'Odds'],
      ['P(X=x)', round(equal(p, n, x),5)],
      ['P(X<x)', round(less(p, n, x),5)],
      ['P(X>x)', round(greater(p, n, x),5)]
    ]);

    let options = {
      'title':'Binomial Distribution', 
      legend: {textStyle:{color: night ? '#ccc' : '#333'}}, 
      titleTextStyle:{color: night ? '#ccc' : '#333'}, 
      'width':'75%', 
      colors: ['#339', '#933', '#393'], 
      backgroundColor: { fill:'transparent' } 
    };

    let chart = new google.visualization.PieChart(document.getElementById('piechart'));
    chart.draw(data, options);

    //bar
    let chartdata = [['','', { role: 'style' } ]];
    for(let numSuccesses = 0; numSuccesses<n+1; numSuccesses++) {
      let color = "#933";
      if(numSuccesses==x) {color="#339";}
      if(numSuccesses>x) {color="#393";}
      chartdata.push([numSuccesses, equal(p,n,numSuccesses), color]);
    }

    data = google.visualization.arrayToDataTable(chartdata);

    options = {
      title: 'Odds by number of successes', 
      titleTextStyle:{color: night ? '#ccc' : '#333'},
      legend: 'none',
      chartArea: {width: '75%', legend:{position: 'none'} },
      hAxis: {
        title: 'Number of Successes x',
        textStyle:{color: night ? '#ccc' : '#333'},
        titleTextStyle:{color: night ? '#ccc' : '#333'}
      },
      vAxis: {
        title: 'P(x)',
        textStyle:{color: night ? '#ccc' : '#333'},
        titleTextStyle:{color: night ? '#ccc' : '#333'}
      },
      backgroundColor: { fill:'transparent' }
    };
  
    chart = new google.visualization.ColumnChart(document.getElementById('barchart'));
    chart.draw(data, options);
  } //end drawChart

} //end calc

let night = false;


$(document).ready(function() {

  let url = new URL(window.location.href);
  let p = url.searchParams.get("p");
  let n = url.searchParams.get("n");
  let x = url.searchParams.get("x");
  console.log("loaded: " + p + ", " + n + ", " + x);
  document.getElementById("pInput").value = p || "0.5";
  document.getElementById("nInput").value = n || "40";
  document.getElementById("xInput").value = x || "18";

  calc();

  //copy buttons
  $('button.copy').click(function() {
    let input = $(this).prev('input'); //select adjacent input
    console.log(input);
    input.prop('disabled',false); //.attr and .disabled didn't work...
    input.select();
    document.execCommand('copy');
    input.prop('disabled',true);
  });

  $('#clearButton').click(function() { //setting onclick in html didn't work for some reason...
    clear();
  });

  $('#fullscreenButton').click(function() {
    toggleFullscreen();
  });

  $('#nightButton').click(function() {
    night = !night;
    if(night) {
      $('#nightStyles').prop('href','styles-night.css');
      calc(); //update google chart with correct color. when your night mode function is O(n^3)...
    }
    else {
      $('#nightStyles').prop('href','');
      calc();
    }
  });

});
