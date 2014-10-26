<!DOCTYPE html>
<html lang="en">
<head>

    <meta charset="utf-8" />
    <meta name="description" content="[c]" />

    <link href="http://fonts.googleapis.com/css?family=Lato:100,300,700,900" rel="stylesheet" type="text/css">
    <link href="css/style.css" rel="stylesheet" type="text/css">

    <script src="js/vendor.js" type="text/javascript"></script>
    <script src="js/scrollgraph.js" type="text/javascript"></script>

    <title>[c]</title>

</head>
<body>

    <svg class="datascales">
        <g class="datascale left"></g>
        <g class="datascale right"></g>
    </svg>

    <svg class="scrollgraph">
        <defs>
            <pattern id="pattern-left" patternContentUnits="objectBoundingBox"></pattern>
            <pattern id="pattern-right" patternContentUnits="objectBoundingBox"></pattern>
        </defs>
        <g class="timescale" id="time" width="100"></g>
        <g class="graph" id="graph-left"></g>
        <g class="graph" id="graph-right"></g>
    </svg>

    <div class="logo">
        <a class="logo-border" href="http://wearecapacity.com/">
            <div class="logo-c">C</div>
        </a>
    </div>

    <script src="js/main.js" type="text/javascript"></script>

<?php //  unstepped tooltips: http://fiddle.jshell.net/c2mru/8/ ?>
</body>
</html>