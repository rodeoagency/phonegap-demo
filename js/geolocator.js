var geowatchID = null;    // ID of the geolocation
var tracking_data = []; // Array containing GPS position objects
var distance_travelled = parseInt(0);
var lat;var lng;
var tmp_distance = parseInt(0);

$("#play").live('click', function(){
    
        console.log('playing');
        myTimer.Timer.toggle();
        
        // Start tracking the User
        if (geowatchID == null && $("#play").hasClass('active')) {
                geowatchID = navigator.geolocation.watchPosition(
        // Success
        function(position){
		  /* alert('Latitude: '          + position.coords.latitude          + '\n' +
				 'Longitude: '         + position.coords.longitude         + '\n' +
				 'Altitude: '          + position.coords.altitude          + '\n' +
				 'Accuracy: '          + position.coords.accuracy          + '\n' +
				 'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
				 'Heading: '           + position.coords.heading           + '\n' +
				 'Speed: '             + position.coords.speed             + '\n' +
				 'Timestamp: '         + new Date(position.timestamp)      + '\n');
		   */
		   //render to frontend
		   
                   
            tracking_data.push(position);
           
            if (tracking_data.length > 1)  {        
               //distance_travelled += calculate_distance_travelled(tracking_data);
               tmp_distance = (getDistanceFromLatLonInKm(lat,lng, position.coords.latitude, position.coords.longitude)*1000).toFixed(2);
            }
            
                  
            // store values for reference when next polled
            lat = position.coords.latitude;
            lng = position.coords.longitude;
            
            
            var geo = $('#geostatus');
            geo.html('Lat: '+ position.coords.latitude + '<br> ' + 'Long: ' + position.coords.longitude  + ' <br>  ' + 'Speed:'+ position.coords.speed + '<br>Distance : '+ tmp_distance + '<br>Total Distance : '+ distance_travelled);
            distance_travelled = parseInt(distance_travelled + tmp_distance);
           
        },
        // Error
        function(error){
            console.log('code: '    + error.code    + '\n' +
                  'message: ' + error.message + '\n');
        },
        // Settings
        { frequency: 1000, enableHighAccuracy: true });
                
    }
    // Tidy up the UI
});

 
$("#stop").live('click', function(){
         myTimer.resetStopwatch();
        $('#play').removeClass('active');
});

$("#save").live('click', function(){
                
                $('#play').removeClass('active');
                alert(tracking_data);
                
                /*var data = tracking_data;
                
                total_km = 0;
                for(i = 0; i < data.length; i++){
                if(i == (data.length - 1)) {
                break;
                }
                total_km += gps_distance(data[i].coords.latitude, data[i].coords.longitude, data[i+1].coords.latitude, data[i+1].coords.longitude);
                }
                total_km_rounded = (total_km*100).toFixed(2);
                alert('total metres: '+total_km_rounded);
                */
                var time_taken = $("#stopwatch").html();
                
                alert(time_taken);
                var date_recorded = '2013-10-05';
                alert(user_id);
                //db.transaction(addScore(,user_id,'123','2013-10-05');
                tx.executeSql("INSERT INTO SCOREBOARD (userid,timer,date) VALUES (?,?,?)",[user_id,time_taken,date_recorded],function(){console.log('ok');},errorCB);
                               
                // Save the tracking data
                //window.localStorage.setItem('game-'+user_id, JSON.stringify(tracking_data));
                
                
                //db.transaction(addScore, errorCB, successCB);
                
                // Stop tracking the user
                navigator.geolocation.clearWatch(geowatchID);
                // Reset watch_id and tracking_data
                if (geowatchID != null) {
                    navigator.geolocation.clearWatch(geowatchID);
                    geowatchID = null;
                    tracking_data = [];
                }
});

$("#reset").live('click', function(){
                
                $('#play').removeClass('active');
                var d = $("#disc");
                d.offset({ top: 180, left: 110 });
                 // Save the tracking data
                distance_travelled = 0;
                clearTimer();
                //db.transaction(addScore, errorCB, successCB);
                
                // Reset watch_id and tracking_data
                if (geowatchID != null) {
                    navigator.geolocation.clearWatch(geowatchID);
                geowatchID = null;
                tracking_data = [];
                
                }
});




// When the user views the history page
$('#maplist').live('pageshow', function () {
                    
                   // Count the number of entries in localStorage and display this information to the user
                   tracks_recorded = window.localStorage.length;
                      
                	alert(window.localStorage.length);
					
                    $("#tracks_recorded").html("<strong>" + tracks_recorded + "</strong> workout(s) recorded");
                   // Empty the list of recorded tracks
                   $("#history_tracklist").empty();
                   // Iterate over all of the recorded tracks, populating the list
                   for(i=0; i<tracks_recorded; i++){
                    	$("#history_tracklist").append("<li><a href='#track_info' data-ajax='false'>" + window.localStorage.key(i) + "</a></li>");
                   }
                   // Tell jQueryMobile to refresh the list
                   $("#history_tracklist").listview('refresh');
});



function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1);
    var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}

function calculate_distance_travelled(data) {
    // Calculate the total distance travelled
                      total_km = 0;
                      
                      console.log('geo entries'+data.length);
                      
                      for(i = 0; i < data.length; i++){
                        if(i == (data.length - 1)) {
                            break;
                      }
                        total_km += getDistanceFromLatLonInKm(data[i].coords.latitude, data[i].coords.longitude, data[i+1].coords.latitude, data[i+1].coords.longitude);
                      }
                      total_km_rounded = (total_km/100).toFixed(2);
                      console.log('total metres: '+total_km_rounded);
                      return total_km_rounded;
}



$("#history_tracklist li a").live('click', function(){
                                  alert($(this).text());
                                  $("#track_info").attr("track_id", $(this).text());
});


// When the user views the Track Info page
$('#track_info').live('pageshow', function(){
                      // Find the track_id of the workout they are viewing
                      var key = $(this).attr("track_id");
                      // Update the Track Info page header to the track_id
                      $("#track_info div[data-role=header] h1").text(key);
                      // Get all the GPS data for the specific workout
                      var data = window.localStorage.getItem(key);
                      // Turn the stringified GPS data back into a JS object
                      data = JSON.parse(data);
                      
                      // Calculate the total distance travelled
                      alert(data.length);
                      
                      total_km = 0;
                      for(i = 0; i < data.length; i++){
                        if(i == (data.length - 1)) {
                            break;
                      }
                        total_km += gps_distance(data[i].coords.latitude, data[i].coords.longitude, data[i+1].coords.latitude, data[i+1].coords.longitude);
                      }
                      total_km_rounded = (total_km*1000).toFixed(2);
                      alert('total metres: '+total_km_rounded);
});
                      


/*

// Set the initial Lat and Long of the Google Map
var myLatLng = new google.maps.LatLng(data[0].coords.latitude, data[0].coords.longitude);
// Google Map options
var myOptions = {
zoom: 15,
center: myLatLng,
mapTypeId: google.maps.MapTypeId.ROADMAP
};
// Create the Google Map, set options
var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

//Google Map API key AIzaSyC6VlQczvogqAKjL38jej7uOcssqWPQTBM
*/