<?php
namespace Capacity\Scrollgraph;
use \ArrayAccess;
class Response implements ArrayAccess {
    /** @var array */
    private $data = [];
    /** @var array */
    private $error = [];
    /** @var array */
    private $message = [];

    public function __construct(array $data = []) {
        if ($data) {
            $this->data = $data;
        }
    }

    public function offsetExists ($offset) {
        return array_key_exists($offset, $this->data);
    }
    public function offsetGet ($offset) {
        return array_key_exists($offset, $this->data) ? $this->data[$offset] : null; 
    }
    public function offsetSet ($offset, $value) {
        $this->data[$offset] = $value;
        return $this;
    }
    public function offsetUnset ($offset) {
        unset($this->data[$offset]);
        return $this;
    }

    public function toArray() {
        return [
            'data' => $this->data,
            'messages' => $this->getMessages(),
            'errors' => $this->getErrors(),
            'status' => $this->isSuccess()
        ];
    }
    
    public function toJson() {
        return json_encode($this->toArray());   
    }

    public function data($key = null, $value = null) {
        if ($key === null) {
            return $this->data;
        } elseif ($value === null) {
            return array_key_exists($key, $this->data) ? $this->data[$key] : null;
        } elseif (is_array($key)) {
            $this->data = $key;
        } else {
            $this->data[(string) $key] = $value;
        }
        return $this;
    }

    public function getErrors() {
        return $this->error;
    }
    public function getMessages() {
        return $this->message;
    }
    public function addError($error) {
        if (is_array($error)) {
            $this->error = array_merge($this->error, $error);
        } else {
            $this->error[] = $error;
        }
        return $this;
    }
    public function addMessage($message) {
        if (is_array($message)) {
            $this->message = array_merge($this->message, $message);
        } else {
            $this->message[] = $message;
        }
        return $this;
    }

    public function isSuccess() {
        return !!$this->error;
    }
} 