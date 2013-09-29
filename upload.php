<?php
$file = $_FILES["filedata"];
if ($file["error"] > 0){
    echo "Error: " . $file["error"] . "<br />";
}else{
    echo $file['name'];
    echo "<script type='text/javascript'>
        window.parent.$('#preview').html(\"<img src='../../photos/". $file["name"] ."' width='400' height='200' />\");
        window.parent.loadFun();
    </script>";
}
?>