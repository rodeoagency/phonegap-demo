// Wait for device API libraries to load
//
document.addEventListener("deviceready", onDeviceReady, false);


var db = window.openDatabase("Database", "1.0", "Puckoff", 200000);
var loggedin = false;
var user_id;
var user_name;
var course_distance;
var geowatchID = null;    // ID of the geolocation
var tracking_data = []; // Array containing GPS position objects
var distance_travelled;
var lat;var lng;
var tmp_distance;
var complete;
var time_taken;

// create database
function createDatabaseSchema(tx) {
    //tx.executeSql('DROP TABLE IF EXISTS USERS');
    tx.executeSql('CREATE TABLE IF NOT EXISTS USERS (userid INTEGER PRIMARY KEY AUTOINCREMENT, username unique, pass)');
    
    //tx.executeSql('DROP TABLE IF EXISTS SCOREBOARD');
    tx.executeSql("CREATE TABLE IF NOT EXISTS SCOREBOARD (username, timer, date_added DATE,distance INTEGER)");
   
}


function resetAll(tx) {
    tx.executeSql('DROP TABLE IF EXISTS USERS');
    tx.executeSql('CREATE TABLE IF NOT EXISTS USERS (userid INTEGER PRIMARY KEY AUTOINCREMENT, username unique, pass)');
    
    tx.executeSql('DROP TABLE IF EXISTS SCOREBOARD');
    tx.executeSql("CREATE TABLE IF NOT EXISTS SCOREBOARD (username, timer, date_added DATE,distance INTEGER)");
   
    
}

// Populate the database
function registerUser(tx) {
    
    //tx.executeSql('CREATE TABLE IF NOT EXISTS DEMO (id unique, username, email, avatar, `password`)');
    
    var username = $("#register input[name=username]").val();
	//var email = $("#register input[name=email]").val();
    var password = $("#register input[name=password]").val();
    tx.executeSql("INSERT INTO USERS (username,pass) values(?,?)",[username,password],registerUserCB,registerUserErrorCB);
                                          
                                                                          
}

function registerUserErrorCB(tx,results) {
    alert('Username already exists - please try again');
}

function registerUserCB(tx,results){
    console.log(results)
    if (results.insertId != null) {
        user_id = results.insertId;
    }
    
    console.log('user logged in with id: '+user_id);
    loggedin = true;
    user_name = $('#register form input[name=username]').val();
    $('#register form input').val('');
    resetGame();
    $.mobile.changePage( "#game", { transition: "fade"} );
}

// Populate the database
function addScore(tx) {
    
    var today_ts = new Date();
    today_ts = today_ts.format("yyyy-MM-dd");
    var time_taken = $("#stopwatch").html();
    var date_recorded = today_ts;
    console.log(user_name+'|'+time_taken+'|'+today_ts+'|'+course_distance);
    tx.executeSql('INSERT INTO SCOREBOARD (username,timer,date_added,distance) VALUES (?,?,?,?)',[user_name,time_taken,today_ts,course_distance]);      
    resetGame();
}

// Query the database
//
function queryDB(tx) {
    var sql = 'SELECT * FROM SCOREBOARD ORDER BY timer LIMIT 20';
    tx.executeSql(sql,[],querySuccessScoreboard,errorCB);
}

function queryDB2(tx) {
    var sql = 'SELECT * FROM USERS';
    tx.executeSql(sql,[],querySuccessUser,errorCB);
}


function signIn(tx) {
    var username = $("#signin input[name=username]").val();
    var password = $("#signin input[name=password]").val();
    var sql = 'SELECT * FROM USERS WHERE `username` = ? AND `pass` = ?';
    tx.executeSql(sql, [username,password], accessGame,errorCB );    // WHERE username = \''+username+'\' AND `password` = \''+password+'\'
}

function accessGame(tx,results) {
    if (results.rows.length) {
        
        loggedin = true;
        $('.logout').show();
        
        for (var i=0; i<results.rows.length; i++){
            user_id = results.rows.item(i).userid;
            user_name = results.rows.item(i).username;
            console.log(user_name);
        }
        complete = 0;
        tracking_data = [];
        $.mobile.changePage( "#game", { transition: "fade"} );
    }
    else
        alert('Could not log in - please try again');
}


// Query the success callback
//
function querySuccess(tx, results) {
    
    console.log(results);
    console.log("Returned rows = " + results.rows.length);
    // this will be true since it was a select statement and so rowsAffected was 0
    if (!results.rowsAffected) {
        //alert('No rows affected!');
        
    }
    if (results.rows.length) {
        
        var len = results.rows.length;
        for (var i=0; i<len; i++){
            
            alert("Row = " + i + " ID = " + results.rows.item(i).userid +
                  " timer =  " + results.rows.item(i).timer +
                  " date =  " + results.rows.item(i).date_added
                  );
        }
    }
    // for an insert statement, this property will return the ID of the last inserted row
    //alert("Last inserted row ID = " + results.insertId);
    if (results.insertId != null) {
      
        user_id = results.insertId;
    }
}

function querySuccessScoreboard(tx, results) {
    
    console.log("Returned rows = " + results.rows.length);
    // this will be true since it was a select statement and so rowsAffected was 0
    
    $("#leaderboard_list").html('');
    
    if (results.rows.length) {
        
        $("#leaderboard_list").append('<table>');
        $("#leaderboard_list").append('<tr><th>Rank</th><th>Name</th><th>Distance</th><th>Time</th></tr>')   
        
        var len = results.rows.length;
        for (var i=0; i<=len; i++){
            $("#leaderboard_list").append('<tr><td>'+(i+1)+'</td><td>'+ results.rows.item(i).username +'</td><td>'+ results.rows.item(i).distance +'</td><td>'+ results.rows.item(i).timer +'</td></tr>');          
                      
        }
         $("#leaderboard_list").append('</table>');
        
    }
    else
        $("#leaderboard_list").append('<p>No scores recorded yet</p>');
    // for an insert statement, this property will return the ID of the last inserted row
    if (results.insertId != null) {
        console.log('username is '+results.rowsAffected.rows.item(0).username);
        user_id = results.insertId;
        
    }
    return;
}


// Transaction error callback
//
function errorCB(err) {
    console.log(err);
    console.log("Error processing SQL: "+err.message);
    return false;
}

// Transaction success callback
//
function successCB() {
    console.log('SQL OK');
    //db.transaction(queryDB, errorCB);
    return true;
}

// device APIs are available
//
function onDeviceReady() {
    db.transaction(createDatabaseSchema, errorCB, successCB);
    checkConnection();
}

function checkConnection() {
            var networkState = navigator.connection.type;

            var states = {};
            states[Connection.UNKNOWN]  = 'Unknown connection';
            states[Connection.ETHERNET] = 'Ethernet connection';
            states[Connection.WIFI]     = 'WiFi connection';
            states[Connection.CELL_2G]  = 'Cell 2G connection';
            states[Connection.CELL_3G]  = 'Cell 3G connection';
            states[Connection.CELL_4G]  = 'Cell 4G connection';
            states[Connection.CELL]     = 'Cell generic connection';
            states[Connection.NONE]     = 'No network connection';
            
            if (networkState == 'none') {
                console.log('no internet');
                //$.mobile.changePage( "#no_internet", { role: "dialog" } );
                alert('Please connect to the internet to play');
            }
        }

$('#leaderboard').live('pageshow', function () {
    db.transaction(queryDB, errorCB, querySuccessScoreboard);
});

$('#game').live('pageshow', function () {
        
    resetGame();
    
    if (!loggedin) {
        //alert('Please sign in');
        $("#dialogue p").html('Please sign in or register to play');
        $.mobile.changePage( "#dialogue", { transition: "pop"} );
        $("#loggedin_username").html('');
    }
    else {
        console.log('UID'+user_id);
        console.log('username'+user_name);
        if(user_name == 'dev')
            $("#geostatus").show();
        else
            $("#geostatus").hide();
        $("#loggedin_username").html('Good luck '+user_name);
    }
    
});


$(function(){
  
  
  $("#reset_all").click(function() {
      db.transaction(resetAll, errorCB, successCB);
  });
  
  $("#play").click(function() {
    $(this).toggleClass('active');
    });
  
  $("#logout").click(function() {
        loggedin = false;
        $("#logout").hide();
        $("#registerBtn, #signinBtn").show();
    });
  
  
  $(".distance").click(function() {
        resetGame();
        course_distance = $(this).attr('data-value');
        $("#gameArea").show();
        $("#introArea").hide();
        console.log('distance: '+course_distance);
    });
  
  $('#homescreen').live('pageshow', function() {
  if(loggedin == false) {
        console.log('not logged in');
        $("#logout").hide();
        $("#reset_wrapper").hide();
        $("#registerBtn, #signinBtn").show();
    }
    else {
        console.log('logged in');
        $("#logout").show();
        $("#registerBtn, #signinBtn").hide();
        if(user_name == 'dev')
            $("#reset_wrapper").show();
        else    
            $("#reset_wrapper").hide();
    }
  });
  
 $('#register').bind('pageinit', function(event) {
    
    $('#register form').validate({
                    rules: {
                            username: {
                                    required: true,
                                    minlength: 3
                            },
                            password: {
                                    required: true,
                                    minlength: 3
                            }
                    },
                    submitHandler: function() { 
                            db.transaction(registerUser, registerUserErrorCB, registerUserCB);
                            event.preventDefault();
                            return false; 
                }
            });
   });
  
  $('#signin').bind('pageinit', function(event) {
    
    $('#signin form').validate({
                    rules: {
                            username: {
                                    required: true,
                                    minlength: 3
                            },
                            password: {
                                    required: true,
                                    minlength: 3
                            }
                    },
                    submitHandler: function() { 
                            db.transaction(signIn,errorCB,successCB);
                            event.preventDefault();
                            return false;	
                }
            });
   });
  
  
});

$(document).live( 'pagebeforechange', function() {
  // hide footer
  $('[data-role=footer]').hide();
});

$(document).live( 'pageshow', function() {
    
    
  // show footer
  $('[data-role=footer]').show();
});


var myTimer = new (function() {
                    var $stopwatch, // Stopwatch element on the page
                    tempo = 100,
                    incrementTime = 100, // Timer speed in milliseconds
                    currentTime = 0, // Current time in hundredths of a second
                    updateTimer = function() {
                        $stopwatch.html(formatTime(currentTime));
                        currentTime += incrementTime / 10;
                    },
                    init = function() {
                        $stopwatch = $('#stopwatch');
                        myTimer.Timer = $.timer(updateTimer, tempo, false);
                    };
                    this.resetStopwatch = function() {
                        currentTime = 0;
                        this.Timer.stop().once();
                        currentTime = 0;
                    };
                    this.addPenalty = function() {
                        incrementTime = 400;
                        $stopwatch.addClass('penalty');
                        $('#target_zone').addClass('penalty-color');
                   };
                   this.removePenalty = function() {
                        incrementTime = 100;
                        $stopwatch.removeClass('penalty');
                        $('#target_zone').removeClass('penalty-color');
                   };
                   
                   $(init);
                   
                   });

function clearTimer() {
    myTimer.resetStopwatch();
}


function resetGame() {
    
    $('#play').removeClass('active');
    var d = $("#disc");
    d.css("top", "110px");
    d.css("left", "110px");
    
    $('#stopwatch').removeClass('penalty');
    $("#target_zone").removeClass('penalty-color');
    
    $("#gameArea").hide();
    $("#introArea").show();
    
    clearTimer();
    
    // Reset watch_id and tracking_data
    if (geowatchID != null) {
        navigator.geolocation.clearWatch(geowatchID);
        geowatchID = null;
    }
    tracking_data = [];
    complete = 0;
    distance_travelled = parseFloat(0);
    tmp_distance = parseFloat(0);
    lat = null;
    lng = null;
    $("#complete div").css('width','0');
    
}
