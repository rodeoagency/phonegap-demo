// Wait for device API libraries to load
//
document.addEventListener("deviceready", onDeviceReady, false);

var loggedin = false;
var user_id;
var user_name;
var db = window.openDatabase("Database", "1.0", "Puckoff", 200000);
var course_distance = null;

// create database
function createDatabaseSchema(tx) {
    tx.executeSql('DROP TABLE IF EXISTS USERS');
    tx.executeSql('CREATE TABLE IF NOT EXISTS USERS (userid INTEGER PRIMARY KEY AUTOINCREMENT, username unique, pass)');
    
    tx.executeSql('DROP TABLE IF EXISTS SCOREBOARD');
    tx.executeSql("CREATE TABLE IF NOT EXISTS SCOREBOARD (userid INTEGER, timer, date_added DATE)");
   
    //tx.executeSql('INSERT INTO SCOREBOARD (userid,timer,date_added) VALUES (?,?,?)',[user_id,'3:08',today_ts],querySuccess,errorCB);
  
}

var today_ts = new Date();
today_ts = today_ts.format("yyyy-MM-dd");


// Populate the database
function registerUser(tx) {
    
    //tx.executeSql('CREATE TABLE IF NOT EXISTS DEMO (id unique, username, email, avatar, `password`)');
    
    var username = $("#register input[name=username]").val();
	//var email = $("#register input[name=email]").val();
    var password = $("#register input[name=password]").val();
    tx.executeSql("INSERT INTO USERS (username,pass) values(?,?)",[username,password],registerUserCB,errorCB);
                                          
                                                                          
}

function registerUserCB(){
    console.log('user logged in with id: '+user_id);
    loggedin = true;
    user_name = $('#register form input[name=username]').val();
    $('#register form input').val('');
    $.mobile.changePage( "#game", { transition: "fade"} );
}

// Populate the database
function addScore(tx) {
    return;
                                          
                                                                          
}

// Query the database
//
function queryDB(tx) {
    var sql = 'SELECT * FROM SCOREBOARD';
    alert('query db'+sql);
    tx.executeSql(sql,[],querySuccess,errorCB);
}

function queryDB2(tx) {
    var sql = 'SELECT * FROM USERS';
    alert('query db'+sql);
    tx.executeSql(sql,[],querySuccessUser,errorCB);
}


function signIn(tx) {
    var username = $("#signin input[name=username]").val();
    var password = $("#signin input[name=password]").val();
    var sql = 'SELECT * FROM USERS WHERE `username` = ? AND `pass` = ?';
    
    alert(sql);
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

function querySuccessUser(tx, results) {
    console.log(results);console.log("Returned rows = " + results.rows.length);
    // this will be true since it was a select statement and so rowsAffected was 0
    if (!results.rowsAffected) {
        //alert('No rows affected!');
        
    }
    if (results.rows.length) {
        
        var len = results.rows.length;
        for (var i=0; i<len; i++){
            
            alert("Row = " + i + " ID = " + results.rows.item(i).userid +
                  " username =  " + results.rows.item(i).username +
                  " pass =  " + results.rows.item(i).pass
                  );
        }
    }
    // for an insert statement, this property will return the ID of the last inserted row
    if (results.insertId != null) {
        console.log('username is '+results.rowsAffected.rows.item(0).username);
        user_id = results.insertId;
        
    }
}


// Transaction error callback
//
function errorCB(err) {
    console.log(err);
    console.log("Error processing SQL: "+err.message);
}

// Transaction success callback
//
function successCB() {
    console.log('SQL OK');
    //db.transaction(queryDB, errorCB);
}

// device APIs are available
//
function onDeviceReady() {
    db.transaction(createDatabaseSchema, errorCB, successCB);
    initForms();
    addScore();
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



function initForms() {
    
    
    //query
    $("#queryBtn").click(function(e){
                         
          db.transaction(queryDB, errorCB, querySuccess);
          e.preventDefault();
          return false;
     });
    
    $("#queryBtn2").click(function(e){
                         
          db.transaction(queryDB2, errorCB, querySuccessUser);
          e.preventDefault();
          return false;
     });
    
}

$('#game').live('pageshow', function () {
                
        if (!loggedin) {
            //alert('Please sign in');
            $("#dialogue p").html('Please sign in to access the game');
            $.mobile.changePage( "#dialogue", { transition: "pop"} );
            $("#loggedin_username").html('');
        }
        else {
            console.log('UID'+user_id);
            console.log('username'+user_name);
            //$("#loggedin_username").html('Hi '+user_name);
        }
});


$(function(){
  var d = $("#disc");
  d.offset({ top: 110, left: 110 });
  
  $("#play").click(function() {
    $(this).toggleClass('active');
    });
  
  $(".logout").click(function() {
        loggedin = false;
        alert('Logged out!');
        $.mobile.changePage( "#homescreen", { transition: "fade"} );
    });
  
  
  $(".distance").click(function() {
//        /alert($(this).attr('data-value'));
        course_distance = $(this).attr('data-value');
        $("#gameArea").show();
        $("#introArea").hide();
        console.log(course_distance);
    });
  
  
  
  if(loggedin == false) {
      console.log('hide logout');
    $('.logout').closest('.ui-btn').hide();
  }
  
 $('#register').bind('pageinit', function(event) {
    console.log('reg init'); 
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
                            db.transaction(registerUser, errorCB, registerUserCB);
                            event.preventDefault();
                            return false; 
                }
            });
   });
  
  $('#signin').bind('pageinit', function(event) {
    console.log('reg init');
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

// Common functions
function pad(number, length) {
    var str = '' + number;
    while (str.length < length) {str = '0' + str;}
    return str;
}
function formatTime(time) {
    var min = parseInt(time / 6000),
    sec = parseInt(time / 100) - (min * 60),
    hundredths = pad(time - (sec * 100) - (min * 6000), 2);
    return (min > 0 ? pad(min, 2) : "00") + ":" + pad(sec, 2) + ":" + hundredths;
}

