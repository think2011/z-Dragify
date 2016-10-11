;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define([], factory)
    } else if (typeof exports === 'object') {
        // Node, CommonJS
        module.exports = factory()
    } else {
        // Window
        root.Dragify = factory()
    }
}(this, function () {
    var Watcher = function () {
        this._events     = {}
        this._tempEvents = {}
    }

    Watcher.prototype = {
        construct: Watcher,

        on: function (type, fn) {
            this._getEvent(type).push(fn)

            var tempEvent = this._getEvent(type, true)
            while (tempEvent.length) {
                fn.apply(fn, tempEvent.shift())
            }

            return this
        },

        emit: function (type) {
            var event  = this._getEvent(type)
            var params = Array.prototype.slice.call(arguments, 1)

            if (event.length) {
                event.forEach(function (fn) {
                    fn.apply(fn, params)
                })
            } else {
                this._getEvent(type, true).push(params)
            }

            return this
        },

        _getEvent: function (type, isTemp) {
            var event = isTemp ? '_tempEvents' : '_events'

            if (!this[event][type]) this[event][type] = []

            return this[event][type]
        },

        off: function (type, fn) {
            var event = this._getEvent(type)

            if (!fn) {
                this._events[type] = []
            } else {
                event.splice(event.indexOf(fn), 1)
            }

            return this
        }
    }

    /**
     * 让元素可拖动
     * @param elem 拖动元素
     */
    function Class(elem) {
        Watcher.call(this)

        this.$elem   = elem
        this.disabled = false
        this.init()
    }

    Class.prototype = Object.create(Watcher.prototype)
    Object.assign(Class.prototype, {
            constructor: Class,

            init: function () {
                var that = this

                this.on('disabled', function () {
                    that.disabled = true
                })

                this.on('enabled', function () {
                    that.disabled = false
                })

                that.$elem.addEventListener(EVENTS[0], function (e) {
                    if(that.disabled) return

                    var eInfo        = that._getEventInfo(e)
                    var $parent      = that.$elem.offsetParent
                    var diffX        = eInfo.clientX - that.$elem.offsetLeft
                    var diffY        = eInfo.clientY - that.$elem.offsetTop
                    var pDiffX       = $parent.offsetLeft || 0
                    var pDiffY       = $parent.offsetTop || 0
                    var windowWidth  = document.documentElement.clientWidth
                    var windowHeight = document.documentElement.clientHeight
                    var elemWidth    = that.$elem.offsetWidth
                    var elemHeight   = that.$elem.offsetHeight
                    var zIndex       = getComputedStyle(that.$elem).zIndex

                    that.$elem.classList.add('drag-start')
                    that.emit('start', that.$elem)
                    document.addEventListener(EVENTS[1], move)
                    function move(e) {
                        var eInfo = that._getEventInfo(e)
                        var left  = eInfo.clientX - diffX
                        var top   = eInfo.clientY - diffY

                        if (left + pDiffX < 0) left = left - (left + pDiffX)
                        if (top + pDiffY < 0) top = top - (top + pDiffY)
                        if (left + pDiffX + elemWidth > windowWidth) left = windowWidth - (pDiffX + elemWidth)
                        if (top + pDiffY + elemHeight > windowHeight) top = windowHeight - (pDiffY + elemHeight)

                        that.$elem.style.position = 'absolute'
                        that.$elem.style.left     = left + 'px'
                        that.$elem.style.top      = top + 'px'
                        that.$elem.style.zIndex   = 19911125

                        that.$elem.classList.add('drag-move')
                        that.emit('move', that.$elem)
                    }

                    document.addEventListener(EVENTS[2], end)
                    function end(e) {
                        that.emit('end', that.$elem)

                        that.$elem.style.zIndex = zIndex
                        that.$elem.classList.remove('drag-start')
                        that.$elem.classList.remove('drag-move')

                        document.removeEventListener(EVENTS[1], move)
                        document.removeEventListener(EVENTS[2], end)
                    }
                })
            },

            _getEventInfo: function (e) {
                return Class.isTouch() ? e.targetTouches[0] : e
            }
        }
    )

    Class.isTouch = function (e) {
        return 'ontouchstart' in window ||
            window.DocumentTouch && document instanceof window.DocumentTouch ||
            navigator.maxTouchPoints > 0 ||
            window.navigator.msMaxTouchPoints > 0
    }

    var EVENTS = Class.isTouch()
        ? ["touchstart", "touchmove", "touchend"]
        : ["mousedown", "mousemove", "mouseup"]

    return Class
}))