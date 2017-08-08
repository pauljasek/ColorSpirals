/**
 * Created by Paul Jasek on 8/6/2017.
 */

(function () {
    var WIDTH = 1920;
    var HEIGHT = 1080;
    var DIAGONAL =  Math.sqrt(WIDTH*WIDTH + HEIGHT*HEIGHT);

    var canvas = document.getElementById("mainCanvas");
    var ctx = canvas.getContext("2d");

    var tmpCanvas = document.createElement("canvas");
    var tmpCtx = tmpCanvas.getContext("2d");

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

    function update(time) {
        if (typeof time === "undefined") {
            time = 0;
        }

        var elapsedTime = time - previousTime;
        previousTime = time;

        var skew = 120 * Math.PI/180;
        var mult = 4;

        updateBackground(ctx, time/1000, mult, skew);
        //updateBackground(ctx, time*time/1000000, time*time/1000000, 45);
        //updateBackground(ctx, time/1000, time/1000, Math.sqrt(time));
        //updateBackground(ctx, time/1000, time/1000, time);
        //updateBackground(ctx, time/1000000, time/1000000, time/1000);

        tmpCanvas.width = WIDTH;
        tmpCanvas.height = HEIGHT;
        updateBackground(tmpCtx, -time/1000, mult, -skew);

        ctx.save();
        ctx.globalAlpha = .5;
        ctx.drawImage(tmpCanvas, 0, 0, WIDTH, HEIGHT);
        ctx.restore();

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