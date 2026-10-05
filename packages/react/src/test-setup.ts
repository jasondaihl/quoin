// Tell React we're in a testing environment so `act()` is supported and flushes
// effects synchronously.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
