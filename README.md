# Striped Background

> Generate customizable striped backgrounds using CSS gradients

### Usage

```js
import stripedBackground from 'striped-background';

const div = document.getElementById('my-div');

Object.assign(div.style, stripedBackground(
    // Pattern, array of [line color, line width] tuples
    [
        ['#ffffff', 40],
        ['rgb(244, 0, 39)', 30],
    ],
    '0.25turn', // Rotation angle
    10, // Offset in pixels
));
```

With Vue 3:

```vue
<script>
import { computed } from 'vue';
import stripedBackground from 'striped-background';

const divStyle = computed(() => ({
  // ... other styles
  ...stripedBackground(
    [
      ['#ffffff', 40],
      ['rgb(244, 0, 39)', 30],
    ],
    '0.25turn',
    10,
  )
}));
</script>
<template>
  <div :style="divStyle"></div>
</template>
```

Animated (see [Examples](#examples)):

```js
const div = document.getElementById('my-div');

let prevTimestamp;
let offset = 0;
const speed = 50 / 1000; // pixels per millisecond

function step(timestamp) {
    if (prevTimestamp === undefined) {
        prevTimestamp = timestamp;
        requestAnimationFrame(step);
        return;
    }
    const distance = (timestamp - prevTimestamp) * speed;
    offset = (offset - distance) % 200;
    Object.assign(div.style, stripedBackground([
        [
            ['#ee1c25', 50],
            ['#ffffff', 50],
            ['#1b76bc', 50],
            ['#ffffff', 50],
        ],
        -45,
        offset,
    ]));
    prevTimestamp = timestamp;
    requestAnimationFrame(step);
}

requestAnimationFrame(step);
```

### Examples

![Example image](example.png)

For live examples visit [examples page](https://downace.github.io/striped-background/examples.html).

Or clone this repo and run local server:

```shell
npx http-server -o examples.html .
```
