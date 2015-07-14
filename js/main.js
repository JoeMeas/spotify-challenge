//Get a list of songs by genre in order of popularity

var data;
var baseUrl = 'https://api.spotify.com/v1/search?type=track&q=genre:';
var myApp = angular.module('myApp', []);

var popMin;
var popMax;

var width = 800
var height = 300

var audioObject = {};
var currentSong;

var myCtrl = myApp.controller('myCtrl', function($scope, $http) {
    $scope.audioObject = {}

    // List Play Function
	$scope.play = function(song) {
		if(audioObject.play != undefined) audioObject.pause()
	    if($scope.currentSong == song) {
	      $scope.audioObject.pause()
	      $scope.currentSong = false
	      return
	    }
	    else {
	      if($scope.audioObject.pause != undefined) $scope.audioObject.pause()
	      $scope.audioObject = new Audio(song);
	      $scope.audioObject.play()  
	      $scope.currentSong = song
	    }
  	}

	$scope.getData = function() {
    	$http.get(baseUrl + $scope.albums).success(function(response){

    	// Clear SVG on each submit
    	$('#my-svg').empty();

    	// Get album items
        data = $scope.data = response.tracks.items;

        if(data.length == 0){
        	d3.select('#my-svg').append('text')
	        	.attr('x', 30)             
	        	.attr('y', 30)
	        	.style('font-weight', 'bold')
	        	.style('font-size', 18)
	   			.style('fill', 'red')
				.text("No genres matching your search. Please try again.");
			return
        }

        // Set min and max popularity
        popMin = d3.min(data, function(d) {return d['popularity']});
        popMax = d3.max(data, function(d) {return d['popularity']});

        // Set scales for popularity
        var popScale = d3.scale.linear()
        	.domain([popMin,popMax])
        	.range([100,width-100])

		// Set axis scale 
		var axisScale = d3.scale.ordinal()
			.domain(['Less Popular', 'More Popular'])
    		.rangePoints([50, width-50]);

        // Set axis
        var axis = d3.svg.axis()
        	.scale(axisScale)
			.orient('bottom');

		// Circle Tooltip
		var tip = d3.tip()
		  .style('line-height', 1)
		  .style('font-weight', 'bold')
		  .style('padding', 12)
		  .style('background', 'rgba(0,0,0,0.8)')
		  .style('color', '#fff')
		  .style('border-radius', 2)
		  .offset([-10, 0])
		  .html(function(d) {
		    return "<div style='padding:8px'><strong>Song:</strong> <p style='color:white'>" + d['name'] + ", " + d['artists'][0]['name'] + "</span><strong></strong></div>";
		  })

        // Draw SVG
		var svg = d3.select('#my-svg');
		svg.append('text')
			.attr('x', 30)             
        	.attr('y', 30)
        	.style('font-weight', 'bold')
        	.style('font-size', 18)
			.text($scope.albums + " songs by popularity");
		svg.append('g')
			.style('fill', 'none')
			.style('stroke', '#000')
			.style('shape-rendering', 'crispEdges')
			.attr("transform", "translate(0," + (height - 30) + ")")
			.call(axis);
		svg.call(tip);

		// Draw circle
		var drawCircle = function(circle){
			circle.attr('r', 25)
				.attr('cx', 50)
				.attr('cy', 240)
				.attr('fill', 'blue')
				.attr('opacity', '0')
				.on('mouseover', function(d){
					tip.show(d)
					d3.select(this)
						.style({opacity:'0.8'})
						.attr('fill', 'red')
				})
				.on('mouseout', function(d){
					tip.hide(d)
					d3.select(this)
						.style({opacity:'0.3'})
						.attr('fill', 'blue')
				})
				// Graph Play Function
				.on('click', function(d) {
					if($scope.audioObject.pause != undefined) $scope.audioObject.pause()
					var song = d['preview_url']
	    			if(currentSong == song){
	    				audioObject.pause()
	    				currentSong = false
	    				return
	    			}else{
	   					if(audioObject.pause != undefined) audioObject.pause()
						audioObject = new Audio(song)
						audioObject.play()
						currentSong = song
					}
				})
           	    .transition().duration(2500)
           	    	.style('opacity', '.3')
           	    	.attr('cx', function(d) {return popScale(d['popularity'])})
		}

		// Draw function
		var draw = function(data){
			var circles = svg.selectAll('circle').data(data);
			circles.enter().append('circle').call(drawCircle);
			circles.exit().remove();
		}
		
		// Draw graph 
		draw(data);
    });
  };
});