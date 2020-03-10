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


        // Tools

        this.tool = "draw"; // draw, erasePath, lasso
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
        this.lassoPath.dashArray = [10, 10];
        this.lassoPath.fillColor = new paper.Color(0.97, 0.97, 0.97);
        this.lassoPath.insertBelow(this.grid);
        this.isSelected = false;
        this.isMoved = false;
        this.minSelectionSize = 20;

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
        this.canvas.addEventListener("pointermove",this.movepointer.bind(this)); // BIND(THIS) : this=Tablica ; this != canvas
        this.canvas.addEventListener("touchmove",this.movepointerTouch.bind(this));
        this.canvas.addEventListener("pointerdown",this.movepointer.bind(this));

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
            line.strokeWidth = 1;
            line.strokeColor = "blue";
            this.grid.addChild(line);
        }

        for (var i = 0; i<this.canHeight;i+=this.gridStepY)
        {
            var p1 = new paper.Point(0,i);
            var p2 = new paper.Point(this.canWidth,i);
            var line = new paper.Path.Line(p1, p2);
            line.strokeWidth = 1;
            line.strokeColor = "blue";
            this.grid.addChild(line);
        }
        this.firstLayer.activate();
    }

    movepointer(e)
    {

        this.cursorX = e.clientX - this.canvas.getBoundingClientRect().left + this.canvas.scrollLeft;
        this.cursorY = e.clientY - this.canvas.getBoundingClientRect().top + this.canvas.scrollTop;

        this.cursor.position =  new paper.Point(this.cursorX, this.cursorY);
    }

    movepointerTouch(e)
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
                this.cursor.fillColor = "grey";
                break;
            case "grab":
                this.cursor.fillColor = "yellow";
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

        }
    }

    

    // tool properties

    /* ---------------------------------------------- */
    /* ---------------------------------------------- */
    /* ---------------------------------------------- */


    setColor()
    {

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
            if (this.lassoPath.contains(new paper.Point(this.cursorX,this.cursorY)))
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
            yOut: yOut
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

    importPathsFromHTML()
    {
        // first: loadHTMLFile(...) . Reason loadfile is async?!
        
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(this.fileReader.result,"text/xml"); 
        let tempParagraphs = xmlDoc.childNodes[0].getElementsByTagName("p"); // p-Nodes = frames

        
        console.log(tempParagraphs);

        this.frame = new paper.Group();
        this.currentPath = [-1];
        this.currentFrame = 0;
        this.lastFrame = 0;

        // save, load, redo, undo
        this.simplePaths = [[[]]];
        this.step = [-1];  // for redo/undo
        this.lastStep = [-1];
        this.maxSteps = 5; // max redo-steps


        
        for (let k = 0;k<tempParagraphs.length;k++)
        {         

            
            let tempSVGPaths = tempParagraphs[k].getElementsByTagName("path");
           // console.log(tempSVGPaths);
            
            for (let i = 0;i<tempSVGPaths.length;i++)
            {

                
               

                this.currentPath[this.currentFrame] +=1;
                this.frame.addChild(new paper.Path(tempSVGPaths[i].getAttribute("d")));
                this.frame.children[this.currentPath[this.currentFrame]].strokeColor = tempSVGPaths[i].getAttribute("stroke");
                this.frame.children[this.currentPath[this.currentFrame]].strokeWidth = tempSVGPaths[i].getAttribute("stroke-width");
                this.frame.children[this.currentPath[this.currentFrame]].selected = false;
                if (tempSVGPaths[i].getAttribute("fill") == "none")
                {
                    this.frame.children[this.currentPath[this.currentFrame]].closed = false;
                }
                else
                {
                    this.frame.children[this.currentPath[this.currentFrame]].closed = true;
                }
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
                tempString += "<path fill ='none' stroke-linejoin='round' d='"+this.frame._children[i].pathData +"' stroke-width='"+this.frame._children[i].strokeWidth+"' stroke = '"+this.frame._children[i].strokeColor.toCSS() +"' />\n";
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



