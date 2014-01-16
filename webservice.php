<?php

function safe($value) {
    return mysql_real_escape_string($value);
}


$response['error'] = 'General error';
if (isset($_POST['method'])) {
    
    
    $link = mysql_connect('localhost', 'elrancho_puckoff', 'rwBx5n5xCpfx');
    $db_selected = mysql_select_db('elrancho_puckoff', $link);

    if(!$link || !$db_selected) {
            $response['error'] = 'Could not sync scores - connection issue -' .mysql_error();
            continue;
    }
    
    $response = array();
    
    if($_POST['method'] == 'addscore') {
        $sql = sprintf("INSERT INTO SCOREBOARD (username,timer,date_added,distance) VALUES ('%s','%s','%s','%s')",
                safe($_POST['user_name']),
                safe($_POST['time_taken']),
                safe($_POST['today_ts']),
                safe($_POST['course_distance']));    
    
        if(!$result = mysql_query($sql,$link))
            $response['error'] = 'Could not sync scores - please try again:'.mysql_error();
        else
            $response['status'] = 'OK';
        
    }
    else {
        $sql = sprintf("SELECT * FROM SCOREBOARD ORDER BY timer LIMIT 20",safe($_POST['user_name']));
        $result = false;
        if($result = mysql_query($sql,$link) ) {
            $response['leaderboard'] = array();
            while($row = mysql_fetch_object($result)) {
                $response['leaderboard'][] = $row;
            }
            $response['status'] = 'OK';
        }
    }
    
}
header('Content-type: application/json');
echo json_encode($response,JSON_PRETTY_PRINT);
?>