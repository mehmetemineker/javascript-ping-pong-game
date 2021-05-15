(() => {
    const SETTINGS = {
        CanvasHeight: 500,
        CanvasWidth: 750,
        BoardPadding: 40,
        SlapperLineWidth: 8,
        SlapperLineHeight: 100,
        BallRadius: 7,
        ScoreFontStyle: "bold 16pt Arial"
    }

    const COLORS = {
        White: "#FFFFFF",
        Black: "#000000",
        Green: "#00FF00",
        Red: "#FF0000",
        Yellow: "#FFFF00"
    }

    const STATE = {
        GameSpeed: 6,
        PingSlapperPositionY: 0,
        PongSlapperPositionY: 0,
        PingScore: 0,
        PongScore: 0,
        UpArrowPressed: false,
        DownArrowPressed: false,
        WPressed: false,
        SPressed: false,
        BallPositionX: 0,
        BallPositionY: 0,
        BallPositionSignX: 1,
        BallPositionSignY: 1,
        IsStarted: false
    }

    const hitSound = new Audio('sounds/hitSound.wav');
    const scoreSound = new Audio('sounds/scoreSound.wav');
    const wallHitSound = new Audio('sounds/wallHitSound.wav');

    const canvas = document.getElementById("canvas");
    canvas.height = SETTINGS.CanvasHeight;
    canvas.width = SETTINGS.CanvasWidth;

    const ctx = canvas.getContext("2d");
    ctx.translate(0.5, 0.5);

    SETTINGS.CanvasHeightHalf = SETTINGS.CanvasHeight / 2;
    SETTINGS.CanvasWidthHalf = SETTINGS.CanvasWidth / 2;
    SETTINGS.SlapperLineHeighthHalf = SETTINGS.SlapperLineHeight / 2;

    STATE.PingSlapperPositionY = SETTINGS.CanvasHeightHalf - SETTINGS.SlapperLineHeighthHalf;
    STATE.PongSlapperPositionY = SETTINGS.CanvasHeightHalf - SETTINGS.SlapperLineHeighthHalf;
    STATE.BallPositionX = SETTINGS.CanvasWidthHalf;
    STATE.BallPositionY = SETTINGS.CanvasHeightHalf;

    SETTINGS.DefaultState = { ...STATE };

    function drawBoard() {
        ctx.fillStyle = COLORS.Black;
        ctx.fillRect(0, 0, SETTINGS.CanvasWidth, SETTINGS.CanvasHeight);
    }

    function drawOutLine() {
        ctx.beginPath();

        ctx.strokeStyle = COLORS.Green;
        ctx.lineWidth = 1;

        // Up
        ctx.moveTo(0, SETTINGS.BoardPadding);
        ctx.lineTo(SETTINGS.CanvasWidth, SETTINGS.BoardPadding);


        // Down
        ctx.moveTo(0, SETTINGS.CanvasHeight - SETTINGS.BoardPadding);
        ctx.lineTo(SETTINGS.CanvasWidth, SETTINGS.CanvasHeight - SETTINGS.BoardPadding);

        ctx.stroke();
    }

    function drawMidline() {
        ctx.beginPath();

        ctx.strokeStyle = COLORS.White;
        ctx.lineWidth = 2;

        ctx.moveTo(SETTINGS.CanvasWidthHalf, 0);
        ctx.lineTo(SETTINGS.CanvasWidthHalf, SETTINGS.CanvasHeight);

        ctx.stroke();
    }

    function drawScoreBoard() {
        let textTopPadding = SETTINGS.BoardPadding - 12;

        ctx.fillStyle = COLORS.White;
        ctx.font = SETTINGS.ScoreFontStyle;

        ctx.textAlign = "right";
        ctx.fillText(STATE.PingScore, SETTINGS.CanvasWidthHalf - SETTINGS.BoardPadding, textTopPadding);

        ctx.textAlign = "left";
        ctx.fillText(STATE.PongScore, SETTINGS.CanvasWidthHalf + SETTINGS.BoardPadding, textTopPadding);
    }

    function drawSlapper(positionY, isPong) {
        let positionX = isPong ? SETTINGS.CanvasWidth - SETTINGS.BoardPadding : SETTINGS.BoardPadding;

        ctx.beginPath();

        ctx.strokeStyle = COLORS.White;
        ctx.lineWidth = SETTINGS.SlapperLineWidth;
        ctx.moveTo(positionX, positionY);
        ctx.lineTo(positionX, positionY + SETTINGS.SlapperLineHeight);

        ctx.stroke();
    }

    function drawBall(positionX, positionY) {
        ctx.beginPath();

        ctx.strokeStyle = COLORS.Yellow;
        ctx.arc(positionX, positionY, SETTINGS.BallRadius, 0, 2 * Math.PI);
        ctx.fillStyle = COLORS.Yellow;
        ctx.lineWidth = 1;
        ctx.fill();

        ctx.stroke();
    }

    function moveBall() {
        if (!STATE.IsStarted) {
            return;
        }

        STATE.BallPositionX += STATE.GameSpeed * STATE.BallPositionSignX;
        STATE.BallPositionY += STATE.GameSpeed * STATE.BallPositionSignY;

        if (STATE.BallPositionX < SETTINGS.BoardPadding) {
            newRound();
            STATE.PongScore++;
        }

        if (STATE.BallPositionX > SETTINGS.CanvasWidth - SETTINGS.BoardPadding) {
            newRound();
            STATE.PingScore++;
        }

        if (STATE.BallPositionY >= SETTINGS.CanvasHeight - SETTINGS.BoardPadding - SETTINGS.BallRadius) {
            STATE.BallPositionSignY = -1;
            wallHitSound.play();
        }

        if (STATE.BallPositionY <= SETTINGS.BoardPadding + SETTINGS.BallRadius) {
            STATE.BallPositionSignY = 1;
            wallHitSound.play();
        }

        if (STATE.BallPositionY >= STATE.PongSlapperPositionY &&
            STATE.BallPositionY <= STATE.PongSlapperPositionY + SETTINGS.SlapperLineHeight &&
            STATE.BallPositionX < SETTINGS.CanvasWidth - SETTINGS.BoardPadding &&
            STATE.BallPositionX >= SETTINGS.CanvasWidth - SETTINGS.BoardPadding - SETTINGS.BallRadius) {
            STATE.BallPositionSignX = -1;
            hitSound.play();
        }

        if (STATE.BallPositionY >= STATE.PingSlapperPositionY &&
            STATE.BallPositionY <= STATE.PingSlapperPositionY + SETTINGS.SlapperLineHeight &&
            STATE.BallPositionX < SETTINGS.BoardPadding + SETTINGS.SlapperLineHeight &&
            STATE.BallPositionX <= SETTINGS.BoardPadding + SETTINGS.BallRadius) {
            STATE.BallPositionSignX = 1;
            hitSound.play();
        }
    }

    function moveSlapper() {
        let slapperPositionYMaxValue = SETTINGS.CanvasHeight - SETTINGS.BoardPadding - SETTINGS.SlapperLineHeight;

        if (STATE.UpArrowPressed) {
            STATE.PongSlapperPositionY -= STATE.GameSpeed;
        } else if (STATE.DownArrowPressed) {
            STATE.PongSlapperPositionY += STATE.GameSpeed;
        }

        if (STATE.WPressed) {
            STATE.PingSlapperPositionY -= STATE.GameSpeed;
        } else if (STATE.SPressed) {
            STATE.PingSlapperPositionY += STATE.GameSpeed;
        }

        if (STATE.PongSlapperPositionY <= SETTINGS.BoardPadding) {
            STATE.PongSlapperPositionY = SETTINGS.BoardPadding;
        }

        if (STATE.PingSlapperPositionY <= SETTINGS.BoardPadding) {
            STATE.PingSlapperPositionY = SETTINGS.BoardPadding;
        }

        if (STATE.PongSlapperPositionY >= slapperPositionYMaxValue) {
            STATE.PongSlapperPositionY = slapperPositionYMaxValue
        }

        if (STATE.PingSlapperPositionY >= slapperPositionYMaxValue) {
            STATE.PingSlapperPositionY = slapperPositionYMaxValue
        }
    }

    function resetState() {
        Object.keys(STATE).map(function (key) {
            STATE[key] = SETTINGS.DefaultState[key];
        });
    }

    function newRound() {
        let tempState = { ...STATE };

        resetState();

        STATE.PingScore = tempState.PingScore;
        STATE.PongScore = tempState.PongScore;

        scoreSound.play();
    }

    function render() {
        drawBoard();
        drawOutLine();
        drawMidline();
        drawScoreBoard();
        drawSlapper(STATE.PingSlapperPositionY, false);
        drawSlapper(STATE.PongSlapperPositionY, true);
        drawBall(STATE.BallPositionX, STATE.BallPositionY);
    }

    function update() {
        moveSlapper();
        moveBall();
    }

    function gameLoop() {
        render();
        update();
    }

    window.addEventListener("keydown", (ev) => {
        if (STATE.IsStarted) {
            switch (ev.code) {
                case "ArrowUp": STATE.UpArrowPressed = true; break;
                case "ArrowDown": STATE.DownArrowPressed = true; break;
                case "KeyW": STATE.WPressed = true; break;
                case "KeyS": STATE.SPressed = true; break;
            }
        }
    });

    window.addEventListener("keyup", (ev) => {
        if (STATE.IsStarted) {
            switch (ev.code) {
                case "ArrowUp": STATE.UpArrowPressed = false; break;
                case "ArrowDown": STATE.DownArrowPressed = false; break;
                case "KeyW": STATE.WPressed = false; break;
                case "KeyS": STATE.SPressed = false; break;
            }
        }

        if (ev.code === "Space") {
            STATE.IsStarted = true;
        }

        if (ev.code === "Escape") {
            resetState();
        }
    });

    setInterval(gameLoop, 1000 / 60);
})();
