<?php
namespace Capacity\Scrollgraph;
use \InvalidArgumentException;
use \RangeException;
/**
 * Generates the bandwidth information.
 * The bandwidth information is fake.
 * Numbers represent bytes.
 */
class Bandwidth {

    private $min;
    private $max;
    private $avgMin;
    private $avgMax;
    private $outliers;

    /**
     * Generate random bandwidth statistics.
     * @param int $min In bytes, min possible value
     * @param int $max In bytes, max possible value
     * @param int $avg In bytes, average value
     * @param int $variance In bytes, how far from avg do we generally stray?
     * @param float $outliers What is the % chance of an outlier?
     * @throws InvalidArgumentException
     * @throws RangeException
     */
    public function __construct($min, $max, $avg, $variance, $outliers) {
        if (!is_numeric($min)) throw new InvalidArgumentException('expected numeric min');
        if (!is_numeric($max)) throw new InvalidArgumentException('expected numeric max');
        if (!is_numeric($avg)) throw new InvalidArgumentException('expected numeric avg');
        if (!is_numeric($variance)) throw new InvalidArgumentException('expected numeric variance');
        if (!is_numeric($outliers)) throw new InvalidArgumentException('expected numeric outliers');
        if ($min < 0 || $max < 0) throw new RangeException ('expected positive min/max');
        if ($min > $max) throw new RangeException ('min was greater than max');
        if ($avg > $max || $avg < $min) throw new RangeException ('avg was out of bounds');
        if ($outliers > 1 || $outliers < 0) throw new RangeException ('outliers was out of bounds');
        $this->min = $min;
        $this->max = $max;
        $this->avgMin = $avg - $variance < $min ? $min : $avg - $variance;
        $this->avgMax = $avg + $variance > $max ? $max : $avg + $variance;
        $this->outliers = floor($outliers * 100);
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
        while ($time < $end) {
            $data[] = [
                'time' => $time,
                'data' => $this->datapoint()
            ];
            $time += $step;
        }
        return $data;
    }

    private function datapoint() {
        // is this an outlier?
        if (mt_rand(0, 100) < $this->outliers) {
            return mt_rand($this->min, $this->max);
        }
        return mt_rand($this->avgMin, $this->avgMax);
    }

}
