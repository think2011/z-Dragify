z-Dragify

```js
    let dragify = new Dragify(document.querySelector('#box'))
            .on('start', function () {
                console.log('s')
            })
            .on('move', function () {
                console.log('m')
            })
            .on('end', function () {
                // dragify.emit('disabled')
                // dragify.emit('enabled')
                console.log('e')
            })
```