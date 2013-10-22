<?php
sleep(1);
$index = $_POST['index'];
$str = '';
$numNow = explode(',',$index);
for($i=0,$j=count($numNow);$i<$j;$i++){
    $str .= "<img src='../pdfImages/Page".$numNow[$i].".jpg' /><span class='pageNumber'>----".$numNow[$i]."----</span>&&";
}
if($_POST['firstOr'] != 'true'){
    echo '{"index":"'.$index.'","pageContent":"'.$str.'"}';
}else{
    echo '{"index":"'.$index.'","allNumber":349,"width":794,"height":1122,"title":"高性能JavaScript编程","author":"刘新","pageContent":"'.$str.'"}';
}
?>