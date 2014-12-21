<?php
namespace Capacity\Scrollgraph;

interface DatasetInterface {

    public function get($start, $end, $step);

}
