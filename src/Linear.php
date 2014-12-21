<?php
namespace Capacity\Scrollgraph;
use \InvalidArgumentException;
use \RangeException;

class Linear implements DatasetInterface {

    private $min;
    private $max;
    private $step;

    /**
     * Generate linear bandwidth statistics, for testing
     * @param int $min In bytes, min possible value
     * @param int $max In bytes, max possible value
     * @param int $step In bytes, increment per datapoint
     * @throws InvalidArgumentException
     * @throws RangeException
     */
    public function __construct($min, $max, $step) {
        if (!is_numeric($min)) throw new InvalidArgumentException('expected numeric min');
        if (!is_numeric($max)) throw new InvalidArgumentException('expected numeric max');
        if (!is_numeric($step)) throw new InvalidArgumentException('expected numeric step');
        if ($min < 0 || $max < 0) throw new RangeException ('expected positive min/max');
        if ($min > $max) throw new RangeException ('min was greater than max');
        if ($step < 1) throw new RangeException ('step was out of bounds');
        $this->min = $min;
        $this->max = $max;
        $this->step = $step;
    }

    /**
     * @param int $start
     * @param int $end
     * @param int $step
     * @return array
     */
    public function get($start, $end, $step) {
        if (!is_numeric($start)) throw new InvalidArgumentException('expected numeric min');
        if (!is_numeric($end)) throw new InvalidArgumentException('expected numeric max');
        if (!is_numeric($step)) throw new InvalidArgumentException('expected numeric avg');
        if ($step < 0) throw new RangeException('Step size too small.');
        if ($start > $end) throw new RangeException('Time range ends before it begins.');
        $time = $start;
        $data = [];
        $current = $this->min;
        while ($time < $end) {
            $current += $this->step;
            if ($current > $this->max) {
                $current = $this->min;
            }
            $data[] = [
                'time' => $time,
                'data' => $current
            ];
            $time += $step;
        }
        return $data;
    }

}
