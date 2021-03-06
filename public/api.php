<?php

// it's an API LOL
namespace Capacity\Scrollgraph;
include('../vendor/autoload.php');

// set true for testing purposes
$linear = false;

$response = new Response();
try {
    if (!array_key_exists('start', $_GET)) {
        throw new \RuntimeException('No start time specified.');
    }
    if (!array_key_exists('end', $_GET)) {
        throw new \RuntimeException('No end time specified.');
    }
    if (!array_key_exists('step', $_GET)) {
        throw new \RuntimeException('No step specified.');
    }
    $start = (int) $_GET['start'];
    $end = (int) $_GET['end'];
    $step = (int) $_GET['step']; // 30m

    if ($linear) {
        $bandwidth = new Linear($start, $end, $step);
    } elseif ($_GET['weak']) {
        $bandwidth = new Bandwidth(0, 2400, 2000, 386, .05);
    } else {
        $bandwidth = new Bandwidth(0, 12000, 8000, 1024, .05);
    }
    $response->data('datapoints', $bandwidth->get($start, $end, $step));
} catch (\Exception $e) {
    $response->addError($e->getMessage());
}
echo $response->toJson();