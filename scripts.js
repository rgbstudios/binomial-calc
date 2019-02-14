
function nchoosek(n,k){
	let result = 1;
	for(let i = 1; i <= k; i++) {
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
	return Math.sqrt(variance(p,n,x) );
}

function round(num, digits) {
	return (Math.round(num*Math.pow(10,digits) ) / Math.pow(10,digits) );
}

document.onkeyup = function(e) {
	let code = e.keyCode ? e.keyCode : e.which;
	if(code == 13){ //enter
		calc();
	}
}

function clear() {
	$('#pInput').val('');
	$('#nInput').val('');
	$('#xInput').val('');
}

//https://stackoverflow.com/questions/3900701/onclick-go-full-screen?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
function toggleFullscreen() {
	if ((document.fullScreenElement && document.fullScreenElement !== null) ||
	 (!document.mozFullScreen && !document.webkitIsFullScreen) ) {
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
	let p = parseFloat($('#pInput').val() );
	let n = parseInt($('#nInput').val() );
	let x = parseInt($('#xInput').val() );

	console.log('Calculating... \np: ' + p + ', n: ' + n + ', x: ' + x);

	$('#errorP').html('');
	$('#errorAlert').css('display','none');

	if(isNaN(p) || isNaN(n) || isNaN(x) )
		$('#errorP').html('p, n, and x must be numbers');
	else if(p > 1 || p < 0)
		$('#errorP').html('p must be between 0 and 1');
	else if(n < 0 || x < 0)
		$('#errorP').html('n and x must be positive integers');
	else if(n >= 1000 || x >= 1000)
		$('#errorP').html('n and x must be less than 1000');
	else if(n < x)
		$('#errorP').html('n must be &ge; x');

	if($('#errorP').html() != '') {
		$('#errorAlert').css('display','block');
		return;
	}

	//only if valid inputs

	let url = new URL(window.location.href);
	if(url.searchParams.get('p') ) //update link if exists
		history.replaceState({}, '', '?p=' + p + '&n=' + n + '&x=' + x + '&night=' + (night?1:0) );

	$('#icon').toggleClass('active');

	//display results
	$('#chooseOutput').val(Math.round(nchoosek(n, x) ) );
	$('#equalOutput').val(round(equal(p, n, x),10) );
	$('#lessOutput').val(round(less(p, n, x),10) );
	$('#greaterOutput').val(round(greater(p, n, x),10) );
	$('#lessEqualOutput').val(round(equal(p, n, x) + less(p, n, x),10) );
	$('#greaterEqualOutput').val(round(equal(p, n, x) + greater(p, n, x),10) );
	$('#infoP').html('Mean (&mu;) = ' + round(mean(p, n, x),10) + 
		'<br>Variance (&sigma;) = ' + round(variance(p, n, x),10) + 
		'<br>Standard Deviation (&sigma;<sup>2</sup>) = ' + round(stddev(p, n, x),10) );

	//google charts
	google.charts.load('current', {'packages':['corechart','bar']});
	google.charts.setOnLoadCallback(drawChart);

	function drawChart() {
		//pie
		let data = google.visualization.arrayToDataTable([
			['Set', 'Odds'],
			['P(X=x)', round(equal(p, n, x), 5)],
			['P(X<x)', round(less(p, n, x), 5)],
			['P(X>x)', round(greater(p, n, x), 5)]
		]);

		let foregroundColor = night ? '#ccc' : '#333';

		let options = {
			'title':'Binomial Distribution', 
			legend: {textStyle: {color: foregroundColor} }, 
			titleTextStyle: {color: foregroundColor}, 
			'width':'75%', 
			colors: ['#339', '#933', '#393'], 
			backgroundColor: { fill:'transparent' } 
		};

		let chart = new google.visualization.PieChart(document.getElementById('piechart') );
		chart.draw(data, options);

		//bar
		let chartdata = [['','', { role: 'style' } ]];
		for(let numSuccesses = 0; numSuccesses<n+1; numSuccesses++) {
			let color = '#933';
			if(numSuccesses==x) color = '#339';
			if(numSuccesses>x) color = '#393';
			chartdata.push([numSuccesses, equal(p,n,numSuccesses), color]);
		}

		data = google.visualization.arrayToDataTable(chartdata);

		options = {
			title: 'Probability vs number of successes', 
			titleTextStyle:{color: foregroundColor},
			legend: 'none',
			chartArea: {width: '75%', legend: {position: 'none'} },
			hAxis: {
				title: 'Number of Successes x',
				textStyle: {color: foregroundColor},
				titleTextStyle: {color: foregroundColor}
			},
			vAxis: {
				title: 'P(x)',
				textStyle: {color: foregroundColor},
				titleTextStyle: {color: foregroundColor}
			},
			backgroundColor: {fill:'transparent'}
		};
	
		chart = new google.visualization.ColumnChart(document.getElementById('barchart') );
		chart.draw(data, options);
	} //end drawChart

} //end calc

let night = false;
let linkParams = false;

$(document).ready(function() {

	//copy buttons
	$('button.copy').click(function() {
		let input = $(this).prev('input'); //adjacent input
		input.prop('disabled', false);
		input.select();
		document.execCommand('copy');
		input.prop('disabled', true);
	});

	$('#clearButton').click(clear);

	$('#fullscreenButton').click(toggleFullscreen);

	$('#linkButton').click(function() {
		linkParams = !linkParams;
		if(linkParams) {
			$(this).html('<i class="material-icons">link</i>');
			history.replaceState({}, '', '?p=' + $('#pInput').val() + '&n=' + $('#nInput').val() + '&x=' + $('#xInput').val() + '&night=' + (night?1:0) );
		}
		else {
			$(this).html('<i class="material-icons">link_off</i>');
			window.history.replaceState(null, null, window.location.pathname);
		}
	});

	$('#nightButton').click(function() {
		night = !night;
		if(night) {
			$('#nightStyles').prop('href','night.css');
			$('.meta-theme').prop('content','#333');
			$('#rgbIcon').prop('src','img/rgb-icon-dark.png');
		}
		else {
			$('#nightStyles').prop('href','');
			$('.meta-theme').prop('content','#ccc');
			$('#rgbIcon').prop('src','img/rgb-icon.png');
		}
		if(linkParams)
			history.replaceState({}, '', '?p=' + $('#pInput').val() + '&n=' + $('#nInput').val() + '&x=' + $('#xInput').val() + '&night=' + (night?1:0) );
		calc(); //update chart with correct color
	});

	let url = new URL(window.location.href);
	let p = url.searchParams.get('p');
	let n = url.searchParams.get('n');
	let x = url.searchParams.get('x');
	if(url.searchParams.get('night')=='1')
		$('#nightButton').click();
	console.log('Loaded url params... \np: ' + p + ', n: ' + n + ', x: ' + x);
	//no need to clense input further, calc() takes care of that 
	$('#pInput').val(p || '0.5');
	$('#nInput').val(n || '40');
	$('#xInput').val(x || '18');
	$('#pInput').select();
	if(p)
		$('#linkButton').click();

	calc();

});
