z-Dragify

```js
    new Dragify(document.querySelector('#box'),{
                target: document.querySelector("#box-title")
            })
            .on('start', function () {
                console.log('s')
            })
            .on('move', function () {
                console.log('m')
            })
            .on('end', function () {
                console.log('e')
            })
```