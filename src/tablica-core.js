/*
Copyright <2020> <Lukasz Targas (lukasz.targas@googlemail.com)>

Permission is hereby granted, free of charge, to any person obtaining a copy 
of this software and associated documentation files (the "Software"), to deal 
in the Software without restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies
or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH
THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

class Tablica
{
    // paper.js muss zuerst geladen werden

    constructor(divBox,boxWidth,boxHeight,canWidth,canHeight,gridStepX,gridStepY)
    {
        // Properties

        this.paper = paper;
        this.divBox = divBox;
        this.boxWidth = boxWidth;
        this.boxHeight = boxHeight;

        this.divBox.style.overflow = "scroll";
        this.divBox.style.width = "" +boxWidth+"px";
        this.divBox.style.height = ""+ boxHeight+"px";

        this.canWidth = canWidth;
        this.canHeight = canHeight;

        this.gridStepX = gridStepX;
        this.gridStepY = gridStepY;

        this.currentColor = "black";
        this.currentWidth = 3;
        this.currentDashArray = [1,0];


        // Tools

        this.tool = "draw"; // draw, line, ellipse, magneticLine, magneticEllipse, erasePath, lasso, grab
        this.isPressed = false;
   

        // Create Canvas

        this.canvas = document.createElement('canvas');
        this.canvas.width = canWidth;
        this.canvas.height = canHeight;
        this.canvas.style.background = "white";
        this.canvas.style.touchAction = "none";
       
        this.divBox.appendChild(this.canvas);

        paper.setup(this.canvas);

        // Paths

        this.frame = new paper.Group();
        this.currentPath = [-1];
        this.currentFrame = 0;
        this.lastFrame = 0;

        this.tempPath;

        // save, load, redo, undo
        this.simplePaths = [[[]]];
        this.step = [-1];  // for redo/undo
        this.lastStep = [-1];
        this.maxSteps = 5; // max redo-steps
        this.fileReader = new FileReader(); // need for load from file


        this.grid = new paper.Group();
        this.grid.insertBelow(this.frame);

        // -- lasso

        this.lassoPath = new paper.Path();
        this.lassoPath.closed = true;
        this.lassoPath.strokeWidth = 1.5;
        this.lassoPath.strokeColor = 'black';
        this.lassoPath.dashArray = [8, 8];
        this.lassoPath.fillColor = new paper.Color(0.97, 0.97, 0.97);
        this.lassoPath.insertBelow(this.grid);
        this.isSelected = false;
        this.isMoved = false;
        this.minSelectionSize = 20;

        /*
        LassoPoints
            0: top
            1: top right
            2: right
            3: bottom right
            4: bottom
            5: bottom left
            6: left
            7: top left
        */

            this.lassoPointSize =new paper.Size(30, 30);
            this.lassoPoints = [
            new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(-1000,-1000), this.lassoPointSize)),
            new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(-1000,-1000), this.lassoPointSize)),
            new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(-1000,-1000), this.lassoPointSize)),
            new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(-1000,-1000), this.lassoPointSize)),
            new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(-1000,-1000), this.lassoPointSize)),
            new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(-1000,-1000), this.lassoPointSize)),
            new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(-1000,-1000), this.lassoPointSize)),
            new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(-1000,-1000), this.lassoPointSize))
        ];

        for (let i = 0;i<8;i++)
        { 
            this.lassoPoints[i].strokeColor = 'black';
            this.lassoPoints[i].strokeWidth = 1.5;
            this.lassoPoints[i].fillColor = new paper.Color(0.97, 0.97, 0.97);
            this.lassoPoints[i].insertBelow(this.grid);
        }

        this.lassoPoints[0].pivot = this.lassoPoints[0].bounds.bottomCenter;
        this.lassoPoints[1].pivot = this.lassoPoints[1].bounds.bottomLeft;
        this.lassoPoints[2].pivot = this.lassoPoints[2].bounds.leftCenter;
        this.lassoPoints[3].pivot = this.lassoPoints[3].bounds.topLeft;
        this.lassoPoints[4].pivot = this.lassoPoints[4].bounds.topCenter;
        this.lassoPoints[5].pivot = this.lassoPoints[5].bounds.topRight;
        this.lassoPoints[6].pivot = this.lassoPoints[6].bounds.rightCenter;
        this.lassoPoints[7].pivot = this.lassoPoints[7].bounds.bottomRight;
        

        this.currentLassoPoint = -1;
        this.isInsideLassoPoint = false;

        // Layers

        this.gridLayer = new paper.Layer();
        this.firstLayer = new paper.Layer();
        this.secondLayer = new paper.Layer();

        // Cursor

        this.cursorX = 100;
        this.cursorY = 100;

        this.cursorPrevX = 100;
        this.cursorPrevY = 100;

        this.cursorSize = 8;
        
        this.cursorVisibility = false;

        this.cursor = new paper.Path.Rectangle(new paper.Point(this.cursorX, this.cursorY), new paper.Size(this.cursorSize,this.cursorSize));

        this.cursor.strokeColor = 'black';
        this.cursor.fillColor = 'black';
        this.cursor.shadowColor = "black";
        this.cursor.shadowBlur = 10;

        //-----------------------------------------------------------------------------------------------------
        // EventListener

        /* move */
        this.canvas.addEventListener("pointermove",this.er.bind(this)); // BIND(THIS) : this=Tablica ; this != canvas
        this.canvas.addEventListener("touchmove",this.erTouch.bind(this));
        this.canvas.addEventListener("pointerdown",this.er.bind(this));

        /* Pointer visibility */

        this.canvas.addEventListener("touchstart",this.showCursor.bind(this));
        this.canvas.addEventListener("touchend",this.hideCursor.bind(this));

        this.canvas.addEventListener("pointerover",this.showCursor.bind(this));
        this.canvas.addEventListener("pointerout",this.hideCursor.bind(this));

        this.canvas.addEventListener("pointerenter",this.showCursor.bind(this));
        this.canvas.addEventListener("pointerleave",this.hideCursor.bind(this));

        /* tool */

        this.canvas.addEventListener("mousedown",this.toolFunctionStart.bind(this));
        this.canvas.addEventListener("mouseup",this.toolFunctionEnd.bind(this));
        this.canvas.addEventListener("pointermove",this.toolFunction.bind(this));

        this.canvas.addEventListener("touchstart",this.toolFunctionStart.bind(this));
        this.canvas.addEventListener("touchend",this.toolFunctionEnd.bind(this));
        this.canvas.addEventListener("touchmove",this.toolFunction.bind(this));

        // ##########################################################################

        /* test */

        /*
        this.testPath = new paper.Path.Line( new paper.Point(10,10),  new paper.Point(210,210));
        this.testPath.strokeWidth = 1;
        this.testPath.strokeColor = "black";
        */
    }

    drawGrid()
    {
        this.gridLayer.activate();
        for (var i = 0; i<this.canWidth;i+=this.gridStepX)
        {
            var p1 = new paper.Point(i,0);
            var p2 = new paper.Point(i,this.canHeight);
            var line = new paper.Path.Line(p1, p2);
            line.strokeWidth = 0.5;
            line.strokeColor = "rgb(180,180,180)";
            this.grid.addChild(line);
        }

        for (var i = 0; i<this.canHeight;i+=this.gridStepY)
        {
            var p1 = new paper.Point(0,i);
            var p2 = new paper.Point(this.canWidth,i);
            var line = new paper.Path.Line(p1, p2);
            line.strokeWidth = 0.5;
            line.strokeColor = "rgb(180,180,180)";
            this.grid.addChild(line);
        }
        this.firstLayer.activate();
    }

    er(e)
    {

        this.cursorX = e.clientX - this.canvas.getBoundingClientRect().left + this.canvas.scrollLeft;
        this.cursorY = e.clientY - this.canvas.getBoundingClientRect().top + this.canvas.scrollTop;

        this.cursor.position =  new paper.Point(this.cursorX, this.cursorY);
    }

    erTouch(e)
    {

        this.cursorX = e.touches[0].clientX - this.canvas.getBoundingClientRect().left + this.canvas.scrollLeft;
        this.cursorY = e.touches[0].clientY - this.canvas.getBoundingClientRect().top + this.canvas.scrollTop;

        this.cursor.position =  new paper.Point(this.cursorX, this.cursorY);
        this.cursor.visible = true;

    }


    showGrid()
    {
        this.gridLayer.visible = true;
    }

    hideGrid()
    {
        this.gridLayer.visible = false;
    }


    showCursor()
    {
        this.cursor.visible = true;
    }

    hideCursor()
    {
        this.cursor.visible = false;
    }


    /* ---------------------------------------------- */
    /* ---------------------------------------------- */
    /* ---------------------------------------------- */
    /* ---------------------------------------------- */
    /* ---------------------------------------------- */
    /* ---------------------------------------------- */

    /* tools */


    setTool(tool)
    {
        
        this.tool = tool;

        switch (this.tool)
        {
            case "draw":
                this.cursor.fillColor = "black";
                this.unselectPaths();
                break;
            case "erasePath":
                this.cursor.fillColor = "white";
                this.unselectPaths();
                break;
            case "lasso":
                this.cursor.fillColor = "black";
                break;
            case "grab":
                this.cursor.fillColor = "black";
                break;
            case "line":
                this.cursor.fillColor = "black";
                break;
            case "ellipse":
                this.cursor.fillColor = "black";
                break;
            case "magneticLine":
                this.cursor.fillColor = "black";
                break;
            case "magneticEllipse":
                this.cursor.fillColor = "black";
                break;
        }
    }



    toolFunctionStart()
    {
        this.isPressed = true;
        switch (this.tool)
        {
            case "draw":
                this.drawStart();
                break;
            case "erasePath":
                this.erasePathStart();
                break;
            case "lasso":
                this.lassoStart();
                break;
            case "grab":
                this.grabStart();
                break;
            case "line":
                this.lineStart();
                break;
            case "ellipse":
                this.ellipseStart();
                break;

            case "magneticLine":
                this.magneticLineStart();
                break;
            case "magneticEllipse":
                this.magneticEllipseStart();
                break;
        }
    }

    toolFunction()
    {
        if (this.isPressed)
        {
            switch (this.tool)
            {
                case "draw":
                    this.drawMove();
                    break;
                case "erasePath":
                    this.erasePathMove();
                    break;
                case "lasso":
                    this.lassoMove();
                    break;
                case "grab":
                    this.grabMove();
                    break;
                case "line":
                    this.lineMove();
                    break;
                case "ellipse":
                    this.ellipseMove();
                    break;
                case "magneticLine":
                    this.magneticLineMove();
                    break;
                case "magneticEllipse":
                    this.magneticEllipseMove();
                    break;

            }
        }
    }

    toolFunctionEnd()
    {
        this.isPressed = false;
        switch (this.tool)
        {
            case "draw":
                this.drawEnd();
                break;
            case "erasePath":
                this.erasePathEnd();
                break;
            case "lasso":
                this.lassoEnd();
                break;
            case "grab":
                this.grabEnd();
                break;
            case "line":
                this.lineEnd();
                break;
            case "ellipse":
                this.ellipseEnd();
                break;
            case "magneticLine":
                this.magneticLineEnd();
                break;
            case "magneticEllipse":
                this.magneticEllipseEnd();
                break;

        }
    }

    

    // tool properties

    /* ---------------------------------------------- */
    /* ---------------------------------------------- */
    /* ---------------------------------------------- */


    setColor(c)
    {
        this.currentColor = c;
        this.cursor.fillColor = c;

        let tempItems = paper.project.getItems({selected:true, class:paper.Path});

        for (let i = 0; i < tempItems.length;i++)
        {
            tempItems[i].strokeColor = this.currentColor;
        }

    }

    setStrokeWidth(w)
    {
        this.currentWidth = w;

        let tempItems = paper.project.getItems({selected:true, class:paper.Path});

        for (let i = 0; i < tempItems.length;i++)
        {
            tempItems[i].strokeWidth = this.currentWidth;
        }
    }

    setStrokeDashArray(d)
    {
        this.currentDashArray = d;

        let tempItems = paper.project.getItems({selected:true, class:paper.Path});

        for (let i = 0; i < tempItems.length;i++)
        {
            tempItems[i].dashArray = this.currentDashArray;
        }
    }



    // tool-Funtions

    /* ---------------------------------------------- */
    /* ---------------------------------------------- */
    /* ---------------------------------------------- */

    /* draw */

    drawStart()
    {
        this.currentPath[this.currentFrame] += 1;
        this.frame.addChild(new paper.Path());
        this.frame._children[this.currentPath[this.currentFrame]].strokeColor = this.currentColor;
        this.frame._children[this.currentPath[this.currentFrame]].strokeWidth = this.currentWidth;
        this.frame._children[this.currentPath[this.currentFrame]].dashArray = this.currentDashArray;
        this.frame._children[this.currentPath[this.currentFrame]].strokeCap = "round";
        this.frame._children[this.currentPath[this.currentFrame]].add(new paper.Point(this.cursorX,this.cursorY));
    }

    drawMove()
    {
        this.frame.children[this.currentPath[this.currentFrame]].add(new paper.Point(this.cursorX,this.cursorY));
    }

    drawEnd()
    {
        this.isPressed = false;
        try 
        {
            if ( this.frame.children[this.currentPath[this.currentFrame]]._segments.length == 1)
            {
                this.frame.children[this.currentPath[this.currentFrame]].add(new paper.Point(this.cursorX,this.cursorY));
            }    
            else
            {
                this.frame.children[this.currentPath[this.currentFrame]].simplify(10);
            }
            this.updateSimplePaths();
        }
        catch (err)
        {
            this.isPressed = true;
        }
       
    }




    /* ---------------------------------------------- */
    /* ---------------------------------------------- */
    /* ---------------------------------------------- */

    /* line*/

    lineStart()
    {
        this.currentPath[this.currentFrame] += 1;
        this.frame.addChild(new paper.Path());
        this.frame._children[this.currentPath[this.currentFrame]].strokeColor = this.currentColor;
        this.frame._children[this.currentPath[this.currentFrame]].strokeWidth = this.currentWidth;
        this.frame._children[this.currentPath[this.currentFrame]].dashArray = this.currentDashArray;
        this.frame._children[this.currentPath[this.currentFrame]].strokeCap = "round";
        this.frame._children[this.currentPath[this.currentFrame]].add(new paper.Point(this.cursorX,this.cursorY));
        this.frame._children[this.currentPath[this.currentFrame]].add(new paper.Point(this.cursorX,this.cursorY));
    }

    lineMove()
    {
        this.frame.children[this.currentPath[this.currentFrame]].lastSegment.point.x = this.cursorX;
        this.frame.children[this.currentPath[this.currentFrame]].lastSegment.point.y = this.cursorY;
    }

    lineEnd()
    {
        this.updateSimplePaths();
    }

    /* ---------------------------------------------- */
    /* ---------------------------------------------- */
    /* ---------------------------------------------- */

    /* ellipse */

    ellipseStart()
    {
        this.currentPath[this.currentFrame] += 1;
        this.frame.addChild(new paper.Path());

        this.frame._children[this.currentPath[this.currentFrame]].add(new paper.Point(this.cursorX,this.cursorY));
        this.frame._children[this.currentPath[this.currentFrame]].add(new paper.Point(this.cursorX,this.cursorY));
     
        this.frame.children[this.currentPath[this.currentFrame]].lastSegment.point.x = this.cursorX;
        this.frame.children[this.currentPath[this.currentFrame]].lastSegment.point.y = this.cursorY;
        let rectangle = new paper.Rectangle(this.frame.children[this.currentPath[this.currentFrame]].firstSegment.point, this.frame.children[this.currentPath[this.currentFrame]].lastSegment.point);
   
        this.tempPath = new paper.Path.Ellipse(rectangle);
        this.tempPath.strokeColor = this.currentColor;
        this.tempPath.strokeWidth = this.currentWidth;
        this.tempPath.dashArray = this.currentDashArray;
        this.tempPath.strokeCap = "round";
        this.tempPath.closed = false;

       
    }

    ellipseMove()
    {

        this.tempPath.remove();

        this.frame.children[this.currentPath[this.currentFrame]].lastSegment.point.x = this.cursorX;
        this.frame.children[this.currentPath[this.currentFrame]].lastSegment.point.y = this.cursorY;

        let rectangle = new paper.Rectangle(this.frame.children[this.currentPath[this.currentFrame]].firstSegment.point, this.frame.children[this.currentPath[this.currentFrame]].lastSegment.point);
      
        this.tempPath = new paper.Path.Ellipse(rectangle);
        this.tempPath.strokeColor = this.currentColor;
        this.tempPath.strokeWidth = this.currentWidth;
        this.tempPath.dashArray = this.currentDashArray;
        this.tempPath.strokeCap = "round";
    }

    ellipseEnd()
    {
        this.frame.children[this.currentPath[this.currentFrame]].remove();
        
        this.tempPath.closed = false; // better for animation
        
        this.frame.addChild(this.tempPath.clone());


        this.tempPath.firstSegment; // draw last segment 

        this.frame.children[this.currentPath[this.currentFrame]].add(this.tempPath.firstSegment);
        this.tempPath.remove();
        this.updateSimplePaths();
    }

    /* ---------------------------------------------- */
    /* ---------------------------------------------- */
    /* ---------------------------------------------- */

    /* magnetic line*/

    magneticLineStart()
    {
        this.discretizeMousePosition();
        this.lineStart();
    }

    magneticLineMove()
    {
        this.discretizeMousePosition();
        this.lineMove();
    }

    magneticLineEnd()
    {
        this.lineEnd();
    }

     /* ---------------------------------------------- */
    /* ---------------------------------------------- */
    /* ---------------------------------------------- */

    /* magnetic Ellipse*/

    magneticEllipseStart()
    {
        this.discretizeMousePosition();
        this.ellipseStart();
    }

    magneticEllipseMove()
    {
        this.discretizeMousePosition();
        this.ellipseMove();
    }

    magneticEllipseEnd()
    {
        this.ellipseEnd();
    }

  


    /* discretization of MousePosition */

    discretizeMousePosition()
    {
        
        this.cursorX = this.gridStepX*0.5 * Math.round(this.cursorX*2/this.gridStepX);
        this.cursorY = this.gridStepY*0.5 * Math.round(this.cursorY*2/this.gridStepY);

        this.cursor.position =  new paper.Point(this.cursorX, this.cursorY);
    }

    
    /* ---------------------------------------------- */
    /* ---------------------------------------------- */
    /* ---------------------------------------------- */

    /* erasePath */

    erasePathStart()
    {
        this.erasePath();
    }

    erasePathMove()
    {
        this.erasePath();
    }

    erasePathEnd()
    {
        this.isPressed = false;
        this.updateSimplePaths();
    }

    /* erasePath - subfunctions */

    erasePath()
    {
        for (let i = 0; i<this.frame.children.length;i++)
        {
            if (this.cursor.intersects(this.frame.children[i]))
            {
                this.frame.children[i].remove();
                this.currentPath[this.currentFrame] = this.frame.children.length -1;
            }
            else if (this.frame.children[i].segments[0]._point._x >= this.cursorX - 0.5*this.cursorSize && this.frame.children[i].segments[0]._point._x <= this.cursorX + 0.5*this.cursorSize)
            {
                if (this.frame.children[i].segments[0]._point._y >= this.cursorY - 0.5*this.cursorSize && this.frame.children[i].segments[0]._point._y <= this.cursorY + 0.5*this.cursorSize)
                {
                    this.frame.children[i].remove();
                    this.currentPath[this.currentFrame] = this.frame.children.length -1;
                }
            }
        }


    }

    eraseAllPaths()
    {

        let N = this.frame.children.length -1;
        while (N >= 0)
        {
            this.frame.children[N].remove();
            this.currentPath[this.currentFrame] = this.frame.children.length -1;
            N -= 1;
        }
    }

    /* ---------------------------------------------- */
    /* ---------------------------------------------- */
    /* ---------------------------------------------- */

    /* lasso */

    lassoStart()
    {
        if (paper.project.getItems({selected:true, class:paper.Path}) == [])
        {
            this.lassoPath.removeSegments();
            this.lassoPath.add(new paper.Point(this.cursorX,this.cursorY));
        }
        else
        {
            this.isInsideLassoPoint = false;
            for (let i = 0; i<8 ;i++)
            {
                if (this.lassoPoints[i].contains(new paper.Point(this.cursorX,this.cursorY)))
                {
                    this.currentLassoPoint = i;
                    this.isInsideLassoPoint = true;
                }
            }

            if (this.lassoPath.contains(new paper.Point(this.cursorX,this.cursorY)))
            {
                this.cursorPrevX = this.cursorX;
                this.cursorPrevY = this.cursorY;
                
            }
            else if (this.isInsideLassoPoint)
            {
                this.cursorPrevX = this.cursorX;
                this.cursorPrevY = this.cursorY;
            }
            else
            {
                this.unselectPaths();
            }
        }
    }

    lassoMove()
    {
        if (!this.isSelected)
        {
            this.lassoPath.add(new paper.Point(this.cursorX,this.cursorY));
        }
        else
        {

            let dx = this.cursorX - this.cursorPrevX;
            let dy = this.cursorY - this.cursorPrevY;

            let oldX = null;
            let oldY = null;

            this.cursorPrevX = this.cursorX;
            this.cursorPrevY = this.cursorY;


            // move selection
            if (!this.isInsideLassoPoint)
                {
                let tempItems = paper.project.getItems({selected:true, class:paper.Path});

                for (let i = 0; i < tempItems.length;i++)
                {
                    oldX = tempItems[i].position._x;
                    oldY = tempItems[i].position._y;

                    tempItems[i].position = new paper.Point(oldX + dx, oldY + dy);
                }
                oldX = this.lassoPath.position._x;
                oldY = this.lassoPath.position._y;
                this.lassoPath.position = new paper.Point(oldX + dx, oldY + dy);

                for (let i = 0;i<8;i++)
                { 

                    oldX = this.lassoPoints[i].position._x;
                    oldY = this.lassoPoints[i].position._y;
                    this.lassoPoints[i].position = new paper.Point(oldX + dx, oldY + dy); 
                }  
            }
            // transform selection
            else
            {
                 
                oldX = this.lassoPoints[this.currentLassoPoint].position._x;
                oldY = this.lassoPoints[this.currentLassoPoint].position._y;
                // this.lassoPoints[this.currentLassoPoint].position = new paper.Point(oldX + dx, oldY + dy);

                if (this.currentLassoPoint == 0 && oldY + dy < this.lassoPath.bounds.bottomCenter._y)
                {
                    this.lassoPoints[this.currentLassoPoint].position = new paper.Point(oldX, oldY + dy);
                    this.lassoPoints[7].position = new paper.Point(this.lassoPoints[7].position._x,this.lassoPoints[7].position._y + dy);
                    this.lassoPoints[1].position = new paper.Point(this.lassoPoints[1].position._x,this.lassoPoints[1].position._y + dy);
                    this.lassoPoints[6].position = new paper.Point(this.lassoPoints[6].position._x,this.lassoPoints[6].position._y + 0.5*dy);
                    this.lassoPoints[2].position = new paper.Point(this.lassoPoints[2].position._x,this.lassoPoints[2].position._y + 0.5*dy);
                }
                else if (this.currentLassoPoint == 1 && oldX + dx > this.lassoPath.bounds.leftCenter._x && oldY + dy < this.lassoPath.bounds.bottomCenter._y)
                {
                    this.lassoPoints[this.currentLassoPoint].position = new paper.Point(oldX + dx, oldY + dy);
                    this.lassoPoints[7].position = new paper.Point(this.lassoPoints[7].position._x,this.lassoPoints[7].position._y + dy);
                    this.lassoPoints[0].position = new paper.Point(this.lassoPoints[0].position._x + 0.5*dx,this.lassoPoints[0].position._y + dy);
                    this.lassoPoints[2].position = new paper.Point(this.lassoPoints[2].position._x + dx,this.lassoPoints[2].position._y + 0.5*dy);
                    this.lassoPoints[3].position = new paper.Point(this.lassoPoints[3].position._x + dx,this.lassoPoints[3].position._y);
                    this.lassoPoints[4].position = new paper.Point(this.lassoPoints[4].position._x + 0.5*dx,this.lassoPoints[4].position._y);
                    this.lassoPoints[6].position = new paper.Point(this.lassoPoints[6].position._x,this.lassoPoints[6].position._y+0.5*dy);
                }
                else if (this.currentLassoPoint == 2 && oldX + dx > this.lassoPath.bounds.leftCenter._x)
                {
                    this.lassoPoints[this.currentLassoPoint].position = new paper.Point(oldX+dx, oldY);
                    this.lassoPoints[3].position = new paper.Point(this.lassoPoints[3].position._x + dx,this.lassoPoints[3].position._y);
                    this.lassoPoints[1].position = new paper.Point(this.lassoPoints[1].position._x + dx,this.lassoPoints[1].position._y);
                    this.lassoPoints[0].position = new paper.Point(this.lassoPoints[0].position._x + 0.5*dx,this.lassoPoints[0].position._y);
                    this.lassoPoints[4].position = new paper.Point(this.lassoPoints[4].position._x + 0.5*dx,this.lassoPoints[4].position._y);
                }

                else if (this.currentLassoPoint == 3  && oldX + dx > this.lassoPath.bounds.leftCenter._x && oldY + dy > this.lassoPath.bounds.topCenter._y)
                {
                    this.lassoPoints[this.currentLassoPoint].position = new paper.Point(oldX + dx, oldY + dy);
                    this.lassoPoints[0].position = new paper.Point(this.lassoPoints[0].position._x + 0.5*dx ,this.lassoPoints[0].position._y);
                    this.lassoPoints[4].position = new paper.Point(this.lassoPoints[4].position._x + 0.5*dx,this.lassoPoints[4].position._y + dy);
                    this.lassoPoints[2].position = new paper.Point(this.lassoPoints[2].position._x + dx,this.lassoPoints[2].position._y + 0.5*dy);
                    this.lassoPoints[1].position = new paper.Point(this.lassoPoints[1].position._x + dx,this.lassoPoints[1].position._y);
                    this.lassoPoints[5].position = new paper.Point(this.lassoPoints[5].position._x,this.lassoPoints[5].position._y + dy);
                    this.lassoPoints[6].position = new paper.Point(this.lassoPoints[6].position._x,this.lassoPoints[6].position._y+0.5*dy);
                }

                else if (this.currentLassoPoint == 4 && oldY + dy > this.lassoPath.bounds.topCenter._y)
                {
                    this.lassoPoints[this.currentLassoPoint].position = new paper.Point(oldX, oldY+dy);
                    this.lassoPoints[3].position = new paper.Point(this.lassoPoints[3].position._x,this.lassoPoints[3].position._y + dy);
                    this.lassoPoints[5].position = new paper.Point(this.lassoPoints[5].position._x,this.lassoPoints[5].position._y + dy);
                    this.lassoPoints[6].position = new paper.Point(this.lassoPoints[6].position._x,this.lassoPoints[6].position._y + 0.5*dy);
                    this.lassoPoints[2].position = new paper.Point(this.lassoPoints[2].position._x,this.lassoPoints[2].position._y + 0.5*dy);
                }
                else if (this.currentLassoPoint == 5 && oldX + dx < this.lassoPath.bounds.rightCenter._x && oldY + dy > this.lassoPath.bounds.topCenter._y)
                {
                    this.lassoPoints[this.currentLassoPoint].position = new paper.Point(oldX + dx, oldY + dy);
                    this.lassoPoints[0].position = new paper.Point(this.lassoPoints[0].position._x + 0.5*dx ,this.lassoPoints[0].position._y);
                    this.lassoPoints[4].position = new paper.Point(this.lassoPoints[4].position._x + 0.5*dx,this.lassoPoints[4].position._y + dy);
                    this.lassoPoints[2].position = new paper.Point(this.lassoPoints[2].position._x ,this.lassoPoints[2].position._y + 0.5*dy);
                    this.lassoPoints[7].position = new paper.Point(this.lassoPoints[7].position._x + dx,this.lassoPoints[7].position._y);
                    this.lassoPoints[3].position = new paper.Point(this.lassoPoints[3].position._x,this.lassoPoints[3].position._y + dy);
                    this.lassoPoints[6].position = new paper.Point(this.lassoPoints[6].position._x + dx,this.lassoPoints[6].position._y+0.5*dy);
                }

                else if (this.currentLassoPoint == 6 && oldX + dx < this.lassoPath.bounds.rightCenter._x)
                {
                    this.lassoPoints[this.currentLassoPoint].position = new paper.Point(oldX+dx, oldY);
                    this.lassoPoints[7].position = new paper.Point(this.lassoPoints[7].position._x + dx,this.lassoPoints[7].position._y);
                    this.lassoPoints[5].position = new paper.Point(this.lassoPoints[5].position._x + dx,this.lassoPoints[5].position._y);
                    this.lassoPoints[4].position = new paper.Point(this.lassoPoints[4].position._x + 0.5*dx,this.lassoPoints[4].position._y);
                    this.lassoPoints[0].position = new paper.Point(this.lassoPoints[0].position._x + 0.5*dx,this.lassoPoints[0].position._y);
                }

                else if (this.currentLassoPoint == 7 && oldX + dx < this.lassoPath.bounds.rightCenter._x && oldY + dy < this.lassoPath.bounds.bottomCenter._y)
                {
                    this.lassoPoints[this.currentLassoPoint].position = new paper.Point(oldX + dx, oldY + dy);
                    this.lassoPoints[0].position = new paper.Point(this.lassoPoints[0].position._x + 0.5*dx ,this.lassoPoints[0].position._y + dy);
                    this.lassoPoints[1].position = new paper.Point(this.lassoPoints[1].position._x,this.lassoPoints[1].position._y + dy);
                    this.lassoPoints[2].position = new paper.Point(this.lassoPoints[2].position._x ,this.lassoPoints[2].position._y + 0.5*dy);
                    this.lassoPoints[4].position = new paper.Point(this.lassoPoints[4].position._x + 0.5 * dx,this.lassoPoints[4].position._y);
                    this.lassoPoints[5].position = new paper.Point(this.lassoPoints[5].position._x+dx,this.lassoPoints[5].position._y);
                    this.lassoPoints[6].position = new paper.Point(this.lassoPoints[6].position._x + dx,this.lassoPoints[6].position._y+0.5*dy);
                }

                this.resizeSelectedeObjects(dx,dy);

            }
            this.isMoved = true;


        }
    }

    lassoEnd()
    {
        this.isPressed = false;
        if (!this.isMoved)
        {
            this.selectPaths();
        }
        this.updateSimplePaths();
    }

    /* lasso - subfunctions */


    resizeSelectedeObjects(dx,dy)
    {
        let skaleW = (this.lassoPoints[2].position._x - this.lassoPoints[6].position._x) / this.lassoPath.bounds._width; 
        let skaleH = (this.lassoPoints[4].position._y - this.lassoPoints[0].position._y) / this.lassoPath.bounds._height; 

        let x =  (this.lassoPoints[2].position._x + this.lassoPoints[6].position._x)*0.5;
        let y =  (this.lassoPoints[2].position._y + this.lassoPoints[6].position._y)*0.5;

      

        let center;
        
        if (this.currentLassoPoint == 0)
        {
            center = this.lassoPath.bounds.bottomCenter;
        }
        else if (this.currentLassoPoint == 1)
        {
            center = this.lassoPath.bounds.bottomLeft;
        }
        else if (this.currentLassoPoint == 2)
        {
            center = this.lassoPath.bounds.leftCenter;
        }
        else if (this.currentLassoPoint == 3)
        {
            center = this.lassoPath.bounds.topLeft;
        }
        else if (this.currentLassoPoint == 4)
        {
            center = this.lassoPath.bounds.topCenter;
        }
        else if (this.currentLassoPoint == 5)
        {
            center = this.lassoPath.bounds.topRight;
        }
        else if (this.currentLassoPoint == 6)
        {
            center = this.lassoPath.bounds.rightCenter;
        }
        else if (this.currentLassoPoint == 7)
        {
            center = this.lassoPath.bounds.bottomRight;
        }
        
        this.lassoPath.scale(skaleW,skaleH,center);

        let selectedItems = paper.project.getItems({selected:true, class:paper.Path});
        for (let i = 0; i < selectedItems.length;i++)
        {
            selectedItems[i].scale(skaleW,skaleH,center);
        }

    }

    isInside(area,path)
    {

        if (area.intersects(path))
        {
            return true;
        }

        for (let i=0;i<path.segments.length;i++)
        {
           if (area.contains(path.segments[i]._point))
           {
               return true;
           }
        }

        return false;
    }


    drawSelectRect(tempItems)
    {
        let tempRectangle = null;
        if (tempItems.length == 1) // select one path
        {
            tempRectangle = tempItems[0].bounds;

            let xmin = tempItems[0].bounds.topLeft._x;
            let ymin = tempItems[0].bounds.topLeft._y;

            let xmax = tempItems[0].bounds.bottomRight._x;
            let ymax = tempItems[0].bounds.bottomRight._y;

            if (xmax - xmin < this.minSelectionSize)
            {
                xmax += 0.5*this.minSelectionSize;
                xmin -= 0.5*this.minSelectionSize;
            }

            if (ymax - ymin < this.minSelectionSize)
            {
                ymax += 0.5*this.minSelectionSize;
                ymin -= 0.5*this.minSelectionSize;
            }

            tempRectangle = new paper.Rectangle(new paper.Point(xmin,ymin),new paper.Point(xmax,ymax));
        }
        else // select many paths
        {
            let xmin = tempItems[0].bounds.topLeft._x;
            let ymin = tempItems[0].bounds.topLeft._y;

            let xmax = tempItems[0].bounds.bottomRight._x;
            let ymax = tempItems[0].bounds.bottomRight._y;

            for (let i = 1;i < tempItems.length;i++)
            {
                if (tempItems[i].bounds.topLeft._x < xmin)
                {
                    xmin = tempItems[i].bounds.topLeft._x;
                }
                if (tempItems[i].bounds.topLeft._y < ymin)
                {
                    ymin = tempItems[i].bounds.topLeft._y;
                }
                if (tempItems[i].bounds.bottomRight._x > xmax)
                {
                    xmax = tempItems[i].bounds.bottomRight._x;
                }
                if (tempItems[i].bounds.bottomRight._y > ymax)
                {
                    ymax = tempItems[i].bounds.bottomRight._y;
                }
            }


            if (xmax - xmin < this.minSelectionSize)
            {
                xmax += 0.5*this.minSelectionSize;
                xmin -= 0.5*this.minSelectionSize;
            }

            if (ymax - ymin < this.minSelectionSize)
            {
                ymax += 0.5*this.minSelectionSize;
                ymin -= 0.5*this.minSelectionSize;
            }

            tempRectangle = new paper.Rectangle(new paper.Point(xmin,ymin),new paper.Point(xmax,ymax));
        }

        this.lassoPath.segments = new paper.Path.Rectangle(tempRectangle).segments;
        this.isSelected = true;

        let p = [
                    tempRectangle.topCenter,
                    tempRectangle.topRight,
                    tempRectangle.rightCenter,
                    tempRectangle.bottomRight,
                    tempRectangle.bottomCenter,
                    tempRectangle.bottomLeft,
                    tempRectangle.leftCenter,
                    tempRectangle.topLeft
                ];

        for (let i = 0;i<8;i++)
        { 
            this.lassoPoints[i].position = p[i]; 
        }        


    }

    selectPaths()
    {
        let tempItems = null;
        
        for (let i = 0; i<this.frame.children.length;i++)
        {
            if (this.isInside(this.lassoPath,this.frame.children[i]))
            {
                this.frame.children[i].selected = true;
                tempItems = paper.project.getItems({selected:true, class:paper.Path});
            }
        }

        if (tempItems != null)
        {
            this.drawSelectRect(tempItems); 
        }
        else
        {
            this.lassoPath.removeSegments();
            this.isSelected = false;
        }
    }

    unselectPaths()
    {
        let selectedItems = paper.project.getItems({selected:true, class:paper.Path});
        for (let i = 0; i < selectedItems.length;i++)
        {
            selectedItems[i].selected = false;
        }
        this.lassoPath.removeSegments();
        this.isSelected = false;
        this.isMoved = false;
        this.isInsideLassoPoint = false;


        for (let i = 0; i<8 ;i++)
        {
            this.lassoPoints[i].position = new paper.Point(-1000,-1000);
        }


    }

    /* ---------------------------------------------- */
    /* ---------------------------------------------- */
    /* ---------------------------------------------- */

    /* grab */

    grabStart()
    {
        this.cursorPrevX = this.cursorX;
        this.cursorPrevY = this.cursorY;
    }

    grabMove()
    {
        let dx = this.cursorX - this.cursorPrevX;
        let dy = this.cursorY - this.cursorPrevY;
        this.divBox.scrollLeft += dx;
        this.divBox.scrollTop += dy;
        this.cursorPrevX = this.cursorX;
        this.cursorPrevY = this.cursorY;
    }

    grabEnd()
    {

    }

    /* ---------------------------------------------- */
    /* ---------------------------------------------- */
    /* ---------------------------------------------- */
    /* ---------------------------------------------- */
    /* ---------------------------------------------- */
    /* ---------------------------------------------- */

    /* FRAMES */

    goToNextFrame()
    {

        for (let k = 0;k<this.frame._children.length;k++)
        {
            this.simplePaths[this.currentFrame][this.step[this.currentFrame]].push(this.convertToSimplePath(this.frame._children[k]));
        }


        if (this.currentFrame == this.lastFrame)
        {
            this.lastFrame += 1;
            this.currentPath.push(-1);
            this.simplePaths.push([[]]);
            this.step.push(-1);
            this.lastStep.push(-1);
        }
        this.currentFrame += 1;

        //this.eraseAllPaths();
        this.drawFromSimplePaths();
    }


    goToPreviousFrame()
    {
        if (this.currentFrame > 0)
        {
            this.currentFrame -= 1;
            this.drawFromSimplePaths();
        }
    }

    /* ---------------------------------------------- */
    /* ---------------------------------------------- */
    /* ---------------------------------------------- */
    /* ---------------------------------------------- */
    /* ---------------------------------------------- */
    /* ---------------------------------------------- */


    /* SAVE / IMPORT / EXPORT */

	convertToSimplePath(path)
	{	
        let width = path.strokeWidth;
        let color = path.strokeColor;
        let closed = path.closed;
        let selected = path.selected;
        let dashArray = path.dashArray;

        let x = [];
        let xIn = [];
        let xOut = [];

        let y = [];
        let yIn = [];
        let yOut = [];
	
		for (let k = 0;k < path.segments.length;k++)
        {
            x.push(path.segments[k].point._x);
            xIn.push(path.segments[k]._handleIn._x);
            xOut.push(path.segments[k]._handleOut._x);

            y.push(path.segments[k].point._y);
            yIn.push(path.segments[k]._handleIn._y);
            yOut.push(path.segments[k]._handleOut._y);
        }

        let simplePath = 
        {
            width: width,
            color: color,
            closed: closed,
            selected: selected,
            x : x,
            xIn: xIn,
            xOut: xOut,
            y : y,
            yIn: yIn,
            yOut: yOut,
            dashArray: dashArray
        };

        return simplePath;    


	}


    updateSimplePaths()
    {
        this.step[this.currentFrame] += 1;
        this.simplePaths[this.currentFrame][this.step[this.currentFrame]] = [];

        for (let k = 0;k<this.frame._children.length;k++)
        {
            this.simplePaths[this.currentFrame][this.step[this.currentFrame]].push(this.convertToSimplePath(this.frame._children[k]));
        }
        this.simplePaths[this.currentFrame].push([]);

        if (this.lastStep[this.currentFrame] < this.step[this.currentFrame])
        {
            this.lastStep[this.currentFrame] = this.step[this.currentFrame];
        }
        
    }


    drawFromSimplePaths()
    {
        this.frame.clear();
        this.currentPath[this.currentFrame] = -1;
        if (this.step[this.currentFrame]>-1)
        {
            for (let k = 0;k<this.simplePaths[this.currentFrame][this.step[this.currentFrame]].length;k++)
            {
                this.currentPath[this.currentFrame] += 1;

                let segments = [];

                for (let i = 0;i<this.simplePaths[this.currentFrame][this.step[this.currentFrame]][k].x.length;i++)
                {
                    let p =  new paper.Point(this.simplePaths[this.currentFrame][this.step[this.currentFrame]][k].x[i],this.simplePaths[this.currentFrame][this.step[this.currentFrame]][k].y[i]);
                    let h_in = new paper.Point(this.simplePaths[this.currentFrame][this.step[this.currentFrame]][k].xIn[i],this.simplePaths[this.currentFrame][this.step[this.currentFrame]][k].yIn[i]);
                    let h_out = new paper.Point(this.simplePaths[this.currentFrame][this.step[this.currentFrame]][k].xOut[i],this.simplePaths[this.currentFrame][this.step[this.currentFrame]][k].yOut[i]);
                    
                    segments.push(new paper.Segment(p,h_in,h_out));
                }

                this.frame.addChild(new paper.Path(segments));
                this.frame.children[this.currentPath[this.currentFrame]].strokeColor = this.simplePaths[this.currentFrame][this.step[this.currentFrame]][k].color;
                this.frame.children[this.currentPath[this.currentFrame]].strokeWidth = this.simplePaths[this.currentFrame][this.step[this.currentFrame]][k].width;
                this.frame.children[this.currentPath[this.currentFrame]].dashArray = this.simplePaths[this.currentFrame][this.step[this.currentFrame]][k].dashArray;
                this.frame.children[this.currentPath[this.currentFrame]].selected = this.simplePaths[this.currentFrame][this.step[this.currentFrame]][k].selected;
                this.frame.children[this.currentPath[this.currentFrame]].closed = this.simplePaths[this.currentFrame][this.step[this.currentFrame]][k].closed;
                this.frame.children[this.currentPath[this.currentFrame]].strokeCap = "round";
            }
            let tempItems = paper.project.getItems({selected:true, class:paper.Path});
            if (tempItems.length>0)
            {
                this.drawSelectRect(tempItems);
                this.setTool('lasso');
            }
        }    
    }


    undo()
    {
        if (this.step[this.currentFrame] >= 0)
        {
            this.step[this.currentFrame] -=1;
            this.drawFromSimplePaths();
        }
        
    }

    redo()
    {
        if (this.step[this.currentFrame] < this.lastStep[this.currentFrame])
        {
            this.step[this.currentFrame] +=1;
            this.drawFromSimplePaths();
        }
    }


    loadHTMLFile(input)
    {
        
    
        this.fileReader.readAsText(input.files[0]); // hier muss gewartet werden

    }

    importDashArray(s)
    {
        let dashArray = [];
        let sArray = s.split(" ");

        for (let i = 0;i<sArray.length;i++)
        {
            dashArray.push(Number(sArray[i]));
        }
        return dashArray;
    }

    importPathsFromHTML()
    {
        // first: loadHTMLFile(...) . Reason loadfile is async?!
        
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(this.fileReader.result,"text/xml"); 
        let tempParagraphs = xmlDoc.childNodes[0].getElementsByTagName("p"); // p-Nodes = frames

        this.frame = new paper.Group();
        this.currentPath = [-1];
        this.currentFrame = 0;
        this.lastFrame = 0;

       
        this.simplePaths = [[[]]];
        this.step = [-1]; 
        this.lastStep = [-1];
        this.maxSteps = 5;
        
        for (let k = 0;k<tempParagraphs.length;k++)
        {         

            
            let tempSVGPaths = tempParagraphs[k].getElementsByTagName("path");

            
            for (let i = 0;i<tempSVGPaths.length;i++)
            {

                
               

                this.currentPath[this.currentFrame] +=1;
                this.frame.addChild(new paper.Path(tempSVGPaths[i].getAttribute("d")));
                this.frame.children[this.currentPath[this.currentFrame]].strokeColor = tempSVGPaths[i].getAttribute("stroke");
                this.frame.children[this.currentPath[this.currentFrame]].strokeWidth = tempSVGPaths[i].getAttribute("stroke-width");

                this.frame.children[this.currentPath[this.currentFrame]].dashArray = this.importDashArray(tempSVGPaths[i].getAttribute("stroke-dasharray"));

                this.frame.children[this.currentPath[this.currentFrame]].selected = false;
                if (tempSVGPaths[i].getAttribute("fill") == "none")
                {
                    this.frame.children[this.currentPath[this.currentFrame]].closed = false;
                }
                else
                {
                    this.frame.children[this.currentPath[this.currentFrame]].closed = true;
                }

                if (tempSVGPaths[i].getAttribute("d").includes("z") || tempSVGPaths[i].getAttribute("d").includes("Z"))
                {
                    this.frame.children[this.currentPath[this.currentFrame]].closed = true;
                }

               // console.log(tempSVGPaths[i].getAttribute("d"));

                this.frame.children[this.currentPath[this.currentFrame]].strokeCap = "round";

                
            }
            this.updateSimplePaths();
          //  this.drawFromSimplePaths();
            if (k <tempParagraphs.length-1)
            {
                this.goToNextFrame();
            }
        }
    }


    exportPathsAsHTML()
    {
        let tempString = "<html>";
        
        let tempCurrentFrame = this.currentFrame;
        
            
        for (let k = 0;k<=this.lastFrame;k++)
        {
            this.currentFrame = k;
            this.drawFromSimplePaths();
            tempString += "<p><svg height='"+this.canHeight +"' width='"+this.canWidth +"'>\n";
        
            for (let i = 0; i<this.frame._children.length;i++)
            {

                let dashArray = "";
                for (let j = 0;j<this.frame._children[i].dashArray.length;j++)
                {
                    if (j < this.frame._children[i].dashArray.length -1)
                    {
                        dashArray += ""+this.frame._children[i].dashArray[j]+" ";
                    }
                    else
                    {
                        dashArray += ""+this.frame._children[i].dashArray[j];
                    }
                }    

                tempString += "<path fill ='none' stroke-linejoin='round' d='"+this.frame._children[i].pathData; 
                tempString +="' stroke-dasharray='"+dashArray;
                tempString +="' stroke-width='"+this.frame._children[i].strokeWidth;
                tempString +="' stroke-linecap='round";

                tempString +="' stroke = '"+this.frame._children[i].strokeColor.toCSS() +"' />\n";
            }
            tempString +="</svg></p>\n"
        }
        tempString +="</html>"

        this.currentFrame = tempCurrentFrame;
        this.drawFromSimplePaths();

        let a = window.document.createElement('a');
        a.href = window.URL.createObjectURL(new Blob([tempString], {type: 'text/html'}));
        a.download = 'tablica.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a); 
    }

    copySelectedPathToClipBoard()
    {
        let selectedItems = paper.project.getItems({selected:true, class:paper.Path});

        let tempString = "<svg height='"+this.canHeight +"' width='"+this.canWidth +"'>\n";
        
        for (let i=0;i<selectedItems.length;i++)
        {
            tempString += "<path fill ='none' stroke-linejoin='round' d='"+selectedItems[i].pathData +"' stroke-width='"+selectedItems[i].strokeWidth+"' stroke = '"+selectedItems[i].strokeColor.toCSS() +"' />\n";
        }
        tempString +="</svg>\n"
        var el = document.createElement('textarea');
        el.value = tempString;
        el.setAttribute('readonly', '');
        el.style = {position: 'absolute', left: '-9999px'};
        document.body.appendChild(el);
        el.select();
        el.setSelectionRange(0, 99999);
        document.execCommand('copy');
        document.body.removeChild(el);

    }

    pastePathFromClipBoard()
    {
        var el = document.createElement('textarea');
        el.setAttribute('readonly', '');
        el.style = {position: 'absolute', left: '-9999px'};
        document.body.appendChild(el);
        el.focus();
       // document.execCommand('paste');
       navigator.clipboard.readText().then(clipText => el.value = clipText);
       console.log(el.value);

        document.body.removeChild(el);
    }
    
}



