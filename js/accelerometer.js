// The watch id references the current `watchAcceleration`
    var accwatchID = null;
    var acceleration = null;

    // Wait for device API libraries to load
    //
    document.addEventListener("deviceready", onDeviceReady, false);

    // device APIs are available
    //
    function onDeviceReady() {
        startWatch();
    }

    // Start watching the acceleration
    //
    function startWatch() {

        // Update acceleration every 1 seconds
        var options = { frequency: 100 };

        watchID = navigator.accelerometer.watchAcceleration(onSuccess, onError, options);
        
    }

    // Stop watching the acceleration
    //
    function stopWatch() {
        if (accwatchID) {
            navigator.accelerometer.clearWatch(accwatchID);
            accwatchID = null;
        }
                alert('watch stopped');
    }

    // onSuccess: Get a snapshot of the current acceleration
    //
    function onSuccess(acceleration) {
        
        /*var element = $('#accelerometer');
        element.text('Acceleration X: ' + acceleration.x         + 
                            'Acceleration Y: ' + acceleration.y         + 
                            'Acceleration Z: ' + acceleration.z         + 
                            'Timestamp: '      + acceleration.timestamp );
        */
        moveObject(acceleration);
        
    }

    // onError: Failed to get the acceleration
    //
    function onError() {
        alert('onError!');
    }


// moveObject
function moveObject(acceleration) {
    var myObj = $('#disc');
    
    if (myObj.hasClass('active') == false)
        myObj.addClass('active');
    
    var wall = $('#box');
    var targetZone = $('#target_zone');
    var objPosition = myObj.position();
    var leftBoundary = 0;
    var topBoundary = 0;
    var rightBoundary = wall.width() - myObj.width();
    var bottomBoundary = wall.height() - myObj.height();
    
    //slideSpeed
    var slideSpeed = 12;
    var leftRight = -parseInt(slideSpeed * acceleration.x);
    var topBottom = parseInt(slideSpeed * acceleration.y);
   
    var dx = (myObj.offset().left + (myObj.width()/2)) - (targetZone.offset().left+(targetZone.width()/2));
    var dy = (myObj.offset().top + (myObj.height()/2)) - (targetZone.offset().top + (targetZone.height()/2));
    var distance = parseInt(Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2)));
   
    
    
    //alert('LR'+lefRight+ ' | ' + 'TB'+topBottom);
    //$("#val").html('LR:'+leftRight+ ' | ' + 'TB:'+topBottom+' Z: '+acceleration.z+'<br> TOP:'+objPosition.top+ ' | ' + 'LEFT'+objPosition.left + ' <br>Dist'+distance);
    
    
    if($("#play").hasClass('active')) {
        //handle penalty
        if(distance > 40)
            myTimer.addPenalty();
        else
            myTimer.removePenalty();
    
    
    //right tilt
    if( acceleration.x < 0 && objPosition.left <= rightBoundary ) {
        myObj.animate({
                      left:'+='+leftRight
                      },0);
    }
    //left tilt
    else if( acceleration.x > 0 && objPosition.left > leftBoundary ) {
        myObj.animate({
                      left:'+='+leftRight
                      },0);
    }
    
    //forward tilt
    if( acceleration.y < 0 && objPosition.top > topBoundary ) {
        myObj.animate({
                      top:'+='+topBottom
                      },0);
    }
    //backward tilt
    else if(acceleration.y > 0 && objPosition.top <= bottomBoundary ) {
        myObj.animate({
                      top:'+='+topBottom
                      },0);
    }
     
    }
    
}
