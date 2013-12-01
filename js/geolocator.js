$("#play").live('click', function(){
    
        if(course_distance == 0) {
            $("#gameArea").hide();
            $("#introArea").show();
            resetGame();
        }
            
        myTimer.Timer.toggle();
        var geo = $('#geostatus');
        
        // Start tracking the User
            geowatchID = navigator.geolocation.watchPosition(
            // Success
            function(position){

               if ($("#play").hasClass('active')) {
                        
                    if (position.coords.accuracy <= 10) {

                        if ((tracking_data.length > 1) && lat != null && lng != null)  {        

                            tmp_distance = (getDistanceFromLatLonInKm(lat,lng, position.coords.latitude, position.coords.longitude)*1000);
                            console.log('tmp'+tmp_distance);
                         }

                        // store values for reference when next polled
                        lat = position.coords.latitude;
                        lng = position.coords.longitude;

                        geo.html('Lat: '+ position.coords.latitude + '| ' + 'Long: ' + position.coords.longitude  + '<br>Tmp  : '+ tmp_distance + ' | Total  : '+ distance_travelled + '<br>% : ' + complete + '<br>Time: ' + new Date(position.timestamp).format("h:m:s") + ' | Accuracy (m): ' + position.coords.accuracy);

                        console.log('Lat: '+ position.coords.latitude + '\n' + 'Long: ' + position.coords.longitude  + '\nTmp distance : '+ tmp_distance + '\nTotal Distance : '+ distance_travelled + '\n% Complete: ' + complete + 'Timestamp: ' + new Date(position.timestamp).format("h:m:s")+'\nAcc: ' + position.coords.accuracy );

                        distance_travelled += tmp_distance;
                        complete = Math.floor((distance_travelled/course_distance)*100);

                        console.log('travelled: '+distance_travelled);
                        console.log('% complete: '+complete);
                        console.log('course:'+course_distance);

                        if(complete < 100 && tracking_data.length > 1) {
                            $("#complete div").css('width',complete+'%');
                        }
                        else if(complete >= 100 && tracking_data.length > 1) {
                            //alert(complete);
                            $("#play").removeClass('active');
                            myTimer.Timer.stop().once();
                        $("#gameArea").hide();
                        $("#introArea").show();
                        //geo.html('finished');
                        tracking_data = [];
                        navigator.geolocation.clearWatch(geowatchID);
                        console.log('finished:'+complete);
                        complete = 0;
                        $.mobile.changePage( "#savescreen", { transition: "pop"} );
                        
                    }
                    tracking_data.push(position);
                    }
                }
                else {
                    //geo.html('Paused');
                    tracking_data = [];
                    navigator.geolocation.clearWatch(geowatchID);
                    return;
                }    


            },
            // Error
            function(error){
                console.log('code: '    + error.code    + '\n' +
                      'message: ' + error.message + '\n');
                alert('Error with GPS');
            },
            // Settings
            { frequency: 1000,timeout: 3000, enableHighAccuracy: true });
            
    
    
    // Tidy up the UI
});



$("#save").live('click', function(){
    console.log('saving');
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
