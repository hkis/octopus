<?php
$str = '';
$pageSize = $_POST['pageSize'];
$pageIndex = $_POST['pageIndex'];
for($i=0;$i<$pageSize;$i++){
    $str .= '{"title":"标题标题标题标题'.$i.'","author":"上传者'.$i.'","time":"2013-10-25"}&&';
}
echo $str.'352';
?>