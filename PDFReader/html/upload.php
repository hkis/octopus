<?php
$file = $_FILES["FileData"];
$returnVal = "{\"title\":\"".$file["name"]."\",\"author\":\"".$_POST['Uid']."\",\"time\":\"".date("Y-m-d")."\"}";
 echo '<script type="text/javascript">window.parent.Bing.templateData=\''.$returnVal.'\'</script>';
?>