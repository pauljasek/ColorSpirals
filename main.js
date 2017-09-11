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
        event.preventDefault();
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
    var pointer = false;

    var showDisplayCoolDown = 0;

    canvas.addEventListener("mousemove", function (e) {
        var rect = canvas.getBoundingClientRect();
        var scaleX = canvas.width / rect.width;
        var scaleY = canvas.height / rect.height;

        x = (e.clientX - rect.left) * scaleX * HEIGHT/canvas.height;
        y = (e.clientY - rect.top) * scaleY * HEIGHT/canvas.height;

        showDisplayCoolDown = 2000;
    },false);

    canvas.addEventListener("mousedown", function (e) {
        var rect = canvas.getBoundingClientRect();
        var scaleX = canvas.width / rect.width;
        var scaleY = canvas.height / rect.height;

        x = (e.clientX - rect.left) * scaleX * HEIGHT/canvas.height;
        y = (e.clientY - rect.top) * scaleY * HEIGHT/canvas.height;
        mouseDown = true;

        showDisplayCoolDown = 2000;
    },false);
    canvas.addEventListener("mouseup", function (e) {
        var rect = canvas.getBoundingClientRect();
        var scaleX = canvas.width / rect.width;
        var scaleY = canvas.height / rect.height;

        x = (e.clientX - rect.left) * scaleX * HEIGHT/canvas.height;
        y = (e.clientY - rect.top) * scaleY * HEIGHT/canvas.height;
        mouseDown = false;

        showDisplayCoolDown = 2000;
    },false);

    function drawText(ctx, x, y, text, color, font, centered, stroke, strokeColor)
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
        value: .5,
        minVal: 0,
        maxVal: 1,
        precision: -1,
        hovered: false,
        hoverRange: 1.25,
        changed: false,
        waitForInput: true,
        color: "#FFF",
        disabledColor: "#999",
        displayValue: false,
        showMarker: true,
        enabled: true,
        getValue: function(pos)
        {
            return pos * (this.maxVal - this.minVal) + this.minVal;
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
                ctx.strokeStyle = this.disabledColor;
                ctx.globalAlpha = 0.5;
            }
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + this.height/2);
            ctx.lineTo(this.x + this.width, this.y + this.height/2);
            ctx.stroke();

            ctx.lineWidth = 4;

            if (this.showMarker) {
                ctx.beginPath();
                ctx.moveTo(this.x + this.getPosition(this.value) * this.width, this.y);
                ctx.lineTo(this.x + this.getPosition(this.value) * this.width, this.y + this.height);
                ctx.stroke();
            }

            if (this.enabled) {

                if (this.displayValue) {
                    drawText(ctx, this.x + this.getPosition(this.value) * this.width, this.y + this.height + 15, this.value.toString(), this.color, "12pt Calibri", true);
                }
            }

            ctx.restore();
        },
        update: function(mx, my, mouseDown)
        {
            if (this.enabled) {
                this.hovered = Math.abs(this.x + this.width / 2 - mx) < this.width * this.hoverRange / 2
                    && Math.abs(this.y + this.height / 2 - my) < this.height * this.hoverRange / 2;
                if (this.hovered) {
                    pointer = true;
                }
                if (mouseDown && this.hovered) {
                    var position = Math.min(1, Math.max((mx - this.x) / this.width, 0));
                    if (this.precision < 0) {
                        this.value = Math.round(this.getValue(position) * Math.pow(10, this.precision)) * Math.pow(10, -this.precision);
                    }
                    else {
                        this.value = this.getValue(position).toFixed(this.precision);
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
    var slices = 100;


    var sliders = [];

    var SETTINGS_OFFSET = 50;
    var SPACING_BETWEEN_TEXT_AND_SLIDER = 25;
    var SPACING_BETWEEN_SLIDERS = 120;
    var SLIDER_WIDTH = 500;
    var SLIDER_HEIGHT = 40;

    var settingsGrad = tmpCtx.createLinearGradient(0, 0, WIDTH/2, 0);
    settingsGrad.addColorStop(0, "rgba(0,0,0,1)");
    settingsGrad.addColorStop(1, "rgba(0,0,0,0)");

    var angularVelocitySlider = Object.create(slider);
    var angularAccelerationSlider = Object.create(slider);
    var skewSlider = Object.create(slider);
    var multSlider = Object.create(slider);
    var slicesSlider = Object.create(slider);

    angularVelocitySlider.x = 20;
    angularVelocitySlider.y = SETTINGS_OFFSET + SPACING_BETWEEN_TEXT_AND_SLIDER + 0*SPACING_BETWEEN_SLIDERS;
    angularVelocitySlider.showMarker = true;
    angularVelocitySlider.width = SLIDER_WIDTH;
    angularVelocitySlider.height = SLIDER_HEIGHT;
    angularVelocitySlider.minVal = 0;
    angularVelocitySlider.maxVal = 10800/mult;
    angularVelocitySlider.precision = 0;
    angularVelocitySlider.value = angularVelocity / Math.PI * 180 / .001;
    angularVelocitySlider.displayValue = false;
    angularVelocitySlider.waitForInput = false;
    angularVelocitySlider.action = function() {
        angularAcceleration = 0;
        this.showMarker = true;
        angularAccelerationSlider.showMarker = false;
        angularVelocity = (this.value * .001) * Math.PI / 180;
    };

    angularAccelerationSlider.x = 20;
    angularAccelerationSlider.y = SETTINGS_OFFSET + SPACING_BETWEEN_TEXT_AND_SLIDER + 1*SPACING_BETWEEN_SLIDERS;
    angularAccelerationSlider.showMarker = false;
    angularAccelerationSlider.width = SLIDER_WIDTH;
    angularAccelerationSlider.height = SLIDER_HEIGHT;
    angularAccelerationSlider.minVal = 0;
    angularAccelerationSlider.maxVal = 1;
    angularAccelerationSlider.precision = 2;
    angularAccelerationSlider.value = angularAcceleration / .00001;
    angularAccelerationSlider.displayValue = false;
    angularAccelerationSlider.waitForInput = false;
    angularAccelerationSlider.action = function() {
        this.showMarker = true;
        angularVelocitySlider.showMarker = false;
        angularAcceleration = this.value * .00001;
    };

    skewSlider.x = 20;
    skewSlider.y = SETTINGS_OFFSET + SPACING_BETWEEN_TEXT_AND_SLIDER + 2*SPACING_BETWEEN_SLIDERS;
    skewSlider.width = SLIDER_WIDTH;
    skewSlider.height = SLIDER_HEIGHT;
    skewSlider.minVal = -140;
    skewSlider.maxVal = 140;
    skewSlider.precision = 2;
    skewSlider.value = skew / 180 * Math.PI;
    skewSlider.displayValue = false;
    skewSlider.waitForInput = false;
    skewSlider.action = function() {
        skew = this.value * Math.PI/180;
    };

    multSlider.x = 20;
    multSlider.y = SETTINGS_OFFSET + SPACING_BETWEEN_TEXT_AND_SLIDER + 3*SPACING_BETWEEN_SLIDERS;
    multSlider.width = SLIDER_WIDTH;
    multSlider.height = SLIDER_HEIGHT;
    multSlider.minVal = 1;
    multSlider.maxVal = 50;
    multSlider.precision = 0;
    multSlider.value = mult;
    multSlider.displayValue = true;
    multSlider.waitForInput = false;
    multSlider.action = function() {
        mult = this.value;
        var val = angularVelocitySlider.value;
        angularVelocitySlider.maxVal = 10800/mult;
        angularVelocitySlider.value = Math.min(val, angularVelocitySlider.maxVal);
        if (angularVelocitySlider.showMarker) {
            angularVelocitySlider.action();
        }
    };

    slicesSlider.x = 20;
    slicesSlider.y = SETTINGS_OFFSET + SPACING_BETWEEN_TEXT_AND_SLIDER + 4*SPACING_BETWEEN_SLIDERS;
    slicesSlider.width = SLIDER_WIDTH;
    slicesSlider.height = SLIDER_HEIGHT;
    slicesSlider.minVal = 4;
    slicesSlider.maxVal = 200;
    slicesSlider.precision = 0;
    slicesSlider.value = slices;
    slicesSlider.displayValue = true;
    slicesSlider.waitForInput = false;
    slicesSlider.action = function() {
        slices = this.value;
        var val = multSlider.value;
        multSlider.maxVal = Math.floor(slices/2);
        multSlider.value = Math.min(val, multSlider.maxVal);
        multSlider.action();
    };

    sliders.push(angularVelocitySlider);
    sliders.push(angularAccelerationSlider);
    sliders.push(skewSlider);
    sliders.push(multSlider);
    sliders.push(slicesSlider);


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

        showDisplayCoolDown -= elapsedTime;
        if (showDisplayCoolDown < 0) {
            showDisplayCoolDown = -1;
            document.body.style.cursor = "none";
        }
        else {
            document.body.style.cursor = "auto";

            var alpha = Math.min(1, showDisplayCoolDown/500);
            tmpCtx.clearRect(0, 0, WIDTH, HEIGHT);

            tmpCtx.fillStyle = settingsGrad;
            tmpCtx.fillRect(0, 0, WIDTH, HEIGHT);

            drawText(tmpCtx, 20, SETTINGS_OFFSET + 0 * SPACING_BETWEEN_SLIDERS, "Set a constant angular velocity", "#FFF", "24pt Calibri", false);
            drawText(tmpCtx, 20, SETTINGS_OFFSET + 1 * SPACING_BETWEEN_SLIDERS, "Set a constant angular acceleration", "#FFF", "24pt Calibri", false);
            drawText(tmpCtx, 20, SETTINGS_OFFSET + 2 * SPACING_BETWEEN_SLIDERS, "Set amount of skew in spirals", "#FFF", "24pt Calibri", false);
            drawText(tmpCtx, 20, SETTINGS_OFFSET + 3 * SPACING_BETWEEN_SLIDERS, "Set number of times colors are repeated", "#FFF", "24pt Calibri", false);
            drawText(tmpCtx, 20, SETTINGS_OFFSET + 4 * SPACING_BETWEEN_SLIDERS, "Set total number of spirals", "#FFF", "24pt Calibri", false);

            pointer = false;
            for (var i = 0; i < sliders.length; i++) {
                sliders[i].update(x, y, mouseDown);
                sliders[i].draw(tmpCtx);
            }

            if (pointer) {
                document.body.style.cursor = "pointer";
            }

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.drawImage(tmpCanvas, 0, 0, WIDTH, HEIGHT);
            ctx.restore();

        }

        window.requestAnimationFrame(update);
    }

    function updateBackground(ctx, offset, mult, skew) {
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