$("#play").live('click', function(){
    
        if(course_distance == 0) {
            $("#gameArea").hide();
            $("#introArea").show();
            if (geowatchID != null) {
                navigator.geolocation.clearWatch(geowatchID);
                geowatchID = null;
            }
        }
            
        myTimer.Timer.toggle();
        var geo = $('#geostatus');
        
        // Start tracking the User
        
                console.log('playing');
                geowatchID = navigator.geolocation.watchPosition(
        // Success
        function(position){
		  
             
            console.log(new Date(position.timestamp));
            
            if ($("#play").hasClass('active')) {
                
                tracking_data.push(position);
          
                if (tracking_data.length > 1)  {        
                    console.log("length +1");
               //distance_travelled += calculate_distance_travelled(tracking_data);
                    tmp_distance = (getDistanceFromLatLonInKm(lat,lng, position.coords.latitude, position.coords.longitude)*1000).toFixed(2);
                    console.log(tmp_distance);
                 }
                 
                // store values for reference when next polled
                lat = position.coords.latitude;
                lng = position.coords.longitude;

                geo.html('Lat: '+ position.coords.latitude + '<br> ' + 'Long: ' + position.coords.longitude  + ' <br>  ' + 'Speed:'+ position.coords.speed + '<br>Tmp distance : '+ tmp_distance + '<br>Total Distance : '+ distance_travelled + '% Complete: ' + complete + 'Timestamp: ' + new Date(position.timestamp) );


                distance_travelled += tmp_distance;
                console.log('travelled: '+distance_travelled + 'tmp: '+tmp_distance);
                complete = (distance_travelled/course_distance)*100;
                console.log('% complete: '+complete);
                
                if(complete < 100 && tracking_data.length > 1) {
                    $("#complete div").css('width',complete+'%');
                }
                else if(complete >= 100 && tracking_data.length > 1) {
                    //alert(complete);
                    $("#play").removeClass('active');
                    myTimer.Timer.stop().once();
                    $("#gameArea").hide();
                    $("#introArea").hide();
                    console.log('finished:'+complete);
                    $.mobile.changePage( "#savescreen", { transition: "pop"} );
                    course_distance = null;
                    complete = 0;
                }
                
            }
            else {
                geo.html('Paused');
                tracking_data = [];
                navigator.geolocation.clearWatch(geowatchID);
            }
        },
        // Error
        function(error){
            console.log('code: '    + error.code    + '\n' +
                  'message: ' + error.message + '\n');
        },
        // Settings
        { frequency: 1000,timeout: 3000, enableHighAccuracy: true });
                
    
    
    // Tidy up the UI
});



$("#save").live('click', function(){
    alert('saving');
    $('#play').removeClass('active');
    
    db.transaction(addScore, errorCB, function(){$.mobile.changePage( "#leaderboard", { transition: "pop"} );});

    // Reset watch_id and tracking_data
    if (geowatchID != null) {
        navigator.geolocation.clearWatch(geowatchID);
        geowatchID = null;
        tracking_data = [];
    }
});

$("#reset").live('click', function(){
    resetGame();            
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