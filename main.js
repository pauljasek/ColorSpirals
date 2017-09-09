/**
 * Created by Paul Jasek on 8/6/2017.
 */

(function () {
    window.requestAnimFrame = function(){
        return (
            window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(/* function */ callback){
                window.setTimeout(callback, 1000 / 60);
            }
        );
    }();

    /*
     * Code by Mickey Shine at http://stackoverflow.com/users/115781/mickey-shine
     */
    // --------------------------------------------------------------------------
    function touchHandler(event)
    {
        var touches = event.changedTouches,
            first = touches[0],
            type = "";
        switch(event.type)
        {
            case "touchstart": type = "mousedown"; break;
            case "touchmove":  type = "mousemove"; break;
            case "touchend":   type = "mouseup";   break;
            default:           return;
        }

        // initMouseEvent(type, canBubble, cancelable, view, clickCount,
        //                screenX, screenY, clientX, clientY, ctrlKey,
        //                altKey, shiftKey, metaKey, button, relatedTarget);

        var simulatedEvent = document.createEvent("MouseEvent");
        simulatedEvent.initMouseEvent(type, true, true, window, 1,
            first.screenX, first.screenY,
            first.clientX, first.clientY, false,
            false, false, false, 0/*left*/, null);


        first.target.dispatchEvent(simulatedEvent);
        //event.preventDefault();
    }
    document.addEventListener("touchstart", touchHandler, true);
    document.addEventListener("touchmove", touchHandler, true);
    document.addEventListener("touchend", touchHandler, true);
    document.addEventListener("touchcancel", touchHandler, true);
    // --------------------------------------------------------------------------

    var WIDTH = 1920;
    var HEIGHT = 1080;
    var DIAGONAL =  Math.sqrt(WIDTH*WIDTH + HEIGHT*HEIGHT);

    var canvas = document.getElementById("mainCanvas");
    var ctx = canvas.getContext("2d");

    var tmpCanvas = document.createElement("canvas");
    var tmpCtx = tmpCanvas.getContext("2d");

    var x = 0;
    var y = 0;
    var mouseDown = false;

    canvas.addEventListener("mousemove", function (e) {
        var rect = canvas.getBoundingClientRect();
        var scaleX = canvas.width / rect.width;
        var scaleY = canvas.height / rect.height;

        x = (e.clientX - rect.left) * scaleX * HEIGHT/canvas.height;
        y = (e.clientY - rect.top) * scaleY * HEIGHT/canvas.height;
    },false);

    canvas.addEventListener("mousedown", function (e) {
        var rect = canvas.getBoundingClientRect();
        var scaleX = canvas.width / rect.width;
        var scaleY = canvas.height / rect.height;

        x = (e.clientX - rect.left) * scaleX * HEIGHT/canvas.height;
        y = (e.clientY - rect.top) * scaleY * HEIGHT/canvas.height;
        mouseDown = true;
    },false);
    canvas.addEventListener("mouseup", function (e) {
        var rect = canvas.getBoundingClientRect();
        var scaleX = canvas.width / rect.width;
        var scaleY = canvas.height / rect.height;

        x = (e.clientX - rect.left) * scaleX * HEIGHT/canvas.height;
        y = (e.clientY - rect.top) * scaleY * HEIGHT/canvas.height;
        mouseDown = false;
    },false);

    function drawText(x, y, text, color, font, centered, stroke, strokeColor)
    {
        ctx.save();
        ctx.fillStyle = color;
        ctx.font = font;
        if (centered)
        {
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
        }
        ctx.fillText(text, x, y);
        if (stroke)
        {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = .3;
            ctx.strokeText(text, x, y);
        }
        ctx.restore();
    }

    var slider = {
        x: 0,
        y: 0,
        width: 100,
        height: 25,
        position: .5,
        minVal: 0,
        maxVal: 1,
        precision: -1,
        hovered: false,
        hoverRange: 1.25,
        changed: false,
        waitForInput: true,
        color: "#FFF",
        displayValue: false,
        enabled: true,
        value: function()
        {
            return this.position * (this.maxVal - this.minVal) + this.minVal;
        },
        getPosition: function(val)
        {
            return (val - this.minVal)/(this.maxVal - this.minVal);
        },
        draw: function(ctx)
        {
            ctx.save();
            ctx.strokeStyle = this.color;
            ctx.globalAlpha = 0.5;
            ctx.lineWidth = 3;
            if (this.hovered)
            {
                ctx.globalAlpha = 0.95;
            }

            if (!this.enabled) {
                ctx.strokeStyle = "#999";
                ctx.globalAlpha = 0.5;
            }
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + this.height/2);
            ctx.lineTo(this.x + this.width, this.y + this.height/2);
            ctx.stroke();

            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(this.x + this.position * this.width, this.y);
            ctx.lineTo(this.x + this.position * this.width, this.y + this.height);
            ctx.stroke();

            if (this.enabled) {

                if (this.displayValue) {
                    drawText(this.x + this.position * this.width, this.y + this.height + 15, this.value().toString(), "#FFF", "12pt Calibri", true);
                }
            }

            ctx.restore();
        },
        update: function(mx, my, mouseDown)
        {
            if (this.enabled) {
                this.hovered = Math.abs(this.x + this.width / 2 - mx) < this.width * this.hoverRange / 2
                    && Math.abs(this.y + this.height / 2 - my) < this.height * this.hoverRange / 2;
                if (mouseDown && this.hovered) {
                    this.position = Math.min(1, Math.max((mx - this.x) / this.width, 0));
                    if (this.precision < 0) {
                        this.position = this.getPosition(Math.round(this.value() * Math.pow(10, this.precision)) * Math.pow(10, -this.precision));
                    }
                    else {
                        this.position = this.getPosition(this.value().toFixed(this.precision));
                    }
                    if (!this.waitForInput) {
                        this.action();
                    }
                    this.changed = true;
                }
                else if (this.changed) {
                    this.action();
                    this.changed = false;
                }
            }
        },
        action: function() {}
    }

    function updateWindowSize() {
        canvas.width = document.body.clientWidth;
        canvas.height = document.body.clientHeight;

        WIDTH = HEIGHT * canvas.width/canvas.height;
        DIAGONAL =  Math.sqrt(WIDTH*WIDTH + HEIGHT*HEIGHT);

        var scaleFactor = canvas.height/HEIGHT;
        ctx.scale(scaleFactor, scaleFactor);
    }

    window.onload = window.onresize = function(event) {
        updateWindowSize();
    };

    updateWindowSize();

    var previousTime = 0;

    var offset = 0;
    var angularVelocity = .001;
    var angularAcceleration = 0;
    var skew = 120 * Math.PI/180;
    var mult = 4;

    var sliders = [];

    var SETTINGS_OFFSET = 10;

    var angularVelocitySlider = Object.create(slider);
    var angularAccelerationSlider = Object.create(slider);
    var skewSlider = Object.create(slider);
    var multSlider = Object.create(slider);

    angularVelocitySlider.x = 20;
    angularVelocitySlider.y = SETTINGS_OFFSET;
    angularVelocitySlider.width = 300;
    angularVelocitySlider.height = 35;
    angularVelocitySlider.minVal = -2700;
    angularVelocitySlider.maxVal = 2700;
    angularVelocitySlider.precision = 0;
    angularVelocitySlider.position = angularVelocitySlider.getPosition(angularVelocity / Math.PI * 180 / .001);
    angularVelocitySlider.displayValue = false;
    angularVelocitySlider.waitForInput = false;
    angularVelocitySlider.action = function() {
        angularAcceleration = 0;
        angularVelocity = (this.value() * .001) * Math.PI / 180;
    };

    angularAccelerationSlider.x = 20;
    angularAccelerationSlider.y = SETTINGS_OFFSET + 80;
    angularAccelerationSlider.width = 300;
    angularAccelerationSlider.height = 35;
    angularAccelerationSlider.minVal = -1;
    angularAccelerationSlider.maxVal = 1;
    angularAccelerationSlider.precision = 2;
    angularAccelerationSlider.position = angularAccelerationSlider.getPosition(angularAcceleration / .00001);
    angularAccelerationSlider.displayValue = false;
    angularAccelerationSlider.waitForInput = false;
    angularAccelerationSlider.action = function() {
        angularAcceleration = this.value() * .00001;
    };

    skewSlider.x = 20;
    skewSlider.y = SETTINGS_OFFSET + 2*80;
    skewSlider.width = 300;
    skewSlider.height = 35;
    skewSlider.minVal = -360;
    skewSlider.maxVal = 360;
    skewSlider.precision = 2;
    skewSlider.position = skewSlider.getPosition(skew / 180 * Math.PI);
    skewSlider.displayValue = false;
    skewSlider.waitForInput = false;
    skewSlider.action = function() {
        skew = this.value() * Math.PI/180;
    };

    multSlider.x = 20;
    multSlider.y = SETTINGS_OFFSET + 3*80;
    multSlider.width = 300;
    multSlider.height = 35;
    multSlider.minVal = 1;
    multSlider.maxVal = 20;
    multSlider.precision = 0;
    multSlider.position = multSlider.getPosition(mult);
    multSlider.displayValue = true;
    multSlider.waitForInput = false;
    multSlider.action = function() {
        mult = this.value();
    };



    sliders.push(angularVelocitySlider);
    sliders.push(angularAccelerationSlider);
    sliders.push(skewSlider);
    sliders.push(multSlider);



    function update(time) {
        if (typeof time === "undefined") {
            time = 0;
        }

        var elapsedTime = time - previousTime;
        previousTime = time;

        //updateBackground(ctx, time/1000, mult, skew);

        //updateBackground(ctx, time*time/1000000, time*time/1000000, 45);
        //updateBackground(ctx, time/1000, time/1000, Math.sqrt(time));
        //updateBackground(ctx, time/1000, time/1000, time);
        //updateBackground(ctx, time/1000000, time/1000000, time/1000);

        angularVelocity += elapsedTime * angularAcceleration;
        offset += elapsedTime * angularVelocity;

        //updateBackground(ctx, time*time/1000000, mult, skew);
        updateBackground(ctx, offset, mult, skew);

        tmpCanvas.width = WIDTH;
        tmpCanvas.height = HEIGHT;
        //updateBackground(tmpCtx, -time*time/1000000, mult, -skew);
        updateBackground(tmpCtx, -offset, mult, -skew);

        ctx.save();
        ctx.globalAlpha = .5;
        ctx.drawImage(tmpCanvas, 0, 0, WIDTH, HEIGHT);
        ctx.restore();

        for (var i = 0; i < sliders.length; i++)
        {
            sliders[i].update(x, y, mouseDown);
            sliders[i].draw(ctx);
        }

        window.requestAnimationFrame(update);
    }

    function updateBackground(ctx, offset, mult, skew) {
        var slices = 100;

        ctx.save();
        ctx.translate(WIDTH/2, HEIGHT/2);

        for (var i = 0; i < slices; i++) {
            ctx.strokeStyle = "hsl(" + mult * (i/slices * 360) + ", 80%, 60%)";
            ctx.fillStyle = ctx.strokeStyle;

            var angle1 = i/slices * Math.PI * 2 + offset;
            var angle2 = (i+1)/slices * Math.PI * 2 + offset;

            var endX1 = Math.cos(angle1) * DIAGONAL/2;
            var endY1 = Math.sin(angle1) * DIAGONAL/2;
            var skewX1 = Math.cos(angle1 + skew) * DIAGONAL/4;
            var skewY1 = Math.sin(angle1 + skew) * DIAGONAL/4;

            var endX2 = Math.cos(angle2) * DIAGONAL/2;
            var endY2 = Math.sin(angle2) * DIAGONAL/2;
            var skewX2 = Math.cos(angle2 + skew) * DIAGONAL/4;
            var skewY2 = Math.sin(angle2 + skew) * DIAGONAL/4;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(skewX1, skewY1, endX1, endY1);
            ctx.arc(0, 0, DIAGONAL/2, angle1, angle2);
            ctx.quadraticCurveTo(skewX2, skewY2, 0, 0);
            ctx.fill();
            ctx.closePath();

        }

        ctx.restore();
    }

    update();
}) ();