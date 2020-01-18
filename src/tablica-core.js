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
        this.currentPath = -1;

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
        this.frame.children[this.currentPath].strokeColor = this.currentColor;
        this.frame.children[this.currentPath].strokeWidth = this.currentWidth;
        this.frame.children[this.currentPath].strokeCap = "round";
        this.frame.children[this.currentPath].add(new paper.Point(this.cursorX,this.cursorY));
    }

    drawMove()
    {
        this.frame.children[this.currentPath].add(new paper.Point(this.cursorX,this.cursorY));
    }

    drawEnd()
    {
        this.isPressed = false;
        this.frame.children[this.currentPath].simplify(10);
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
        }
    }

    eraseAllPaths()
    {
        for (let i = 0; i<this.frame.children.length;i++)
        {
            this.frame.children[i].remove();
            this.currentPath[this.currentFrame] = this.frame.children.length -1;    
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
        if (tempItems.length == 1)
        {
            tempRectangle = tempItems[0].bounds;
        }
        else
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

    /* IMPORT / EXPORT */


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

    exportPathsAsJSON()
    {
        let width = [];
        let color = [];
        let closed = [];
        let selected = [];

        let x = [];
        let xIn = [];
        let xOut = [];

        let y = [];
        let yIn = [];
        let yOut = [];

        for (let j=0;j < this.frame.children.length;j++)
        {

            width.push(this.frame.children[j].strokeWidth);
            color.push(this.frame.children[j].strokeColor._components);
            closed.push(this.frame.children[j].closed);
            selected.push(this.frame.children[j].selected);

            x.push([]);
            xIn.push([]);
            xOut.push([]);

            y.push([]);
            yIn.push([]);
            yOut.push([]);

            for (let k = 0;k < this.frame.children[j].segments.length;k++)
            {
                x[j].push(this.frame.children[j].segments[k].point._x);
                xIn[j].push(this.frame.children[j].segments[k]._handleIn._x);
                xOut[j].push(this.frame.children[j].segments[k]._handleOut._x);

                y[j].push(this.frame.children[j].segments[k].point._y);
                yIn[j].push(this.frame.children[j].segments[k]._handleIn._y);
                yOut[j].push(this.frame.children[j].segments[k]._handleOut._y);
            }
        }
        
        let tempTablica = 
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

        let JSONTablica = JSON.stringify(tempTablica);

        return JSONTablica;
    }

    exportPathsAsJSONFile()
    {
        let JSONString = this.exportPathsAsJSON();
        let a = window.document.createElement('a');
        a.href = window.URL.createObjectURL(new Blob([JSONString], {type: 'text/JSON'}));
        a.download = 'tablica.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a); 
    }

    importPathsFromJSON(JSONString)
    {
        let pathsObj = JSON.parse(JSONString);
        let tempSegments;
        this.eraseAllPaths();
        
        for (let j=0;j < pathsObj.x.length;j++)
        {
            tempSegments = [];
            for (let k = 0;k < pathsObj.x[j].length;k++)
            {    
                tempSegments.push(new paper.Segment(
                    new paper.Point(pathsObj.x[j][k], pathsObj.y[j][k]), 
                    new paper.Point(pathsObj.xIn[j][k], pathsObj.yIn[j][k]), 
                    new paper.Point(pathsObj.xOut[j][k] , pathsObj.yOut[j][k])
                    ));          
            }
            
            this.frame.addChild(new paper.Path({
                segments: tempSegments,
                strokeColor: new paper.Color(pathsObj.color[j][0],pathsObj.color[j][1],pathsObj.color[j][2]),
                strokeWidth: pathsObj.width[j],
                strokeCap: 'round',
                closed: pathsObj.closed[j],
                selected: pathsObj.selected[j]
            }));

            this.currentPath[this.currentFrame] += 1;

            if(paper.project.getItems({selected:true, class:paper.Path}).length != 0)
            {
                this.drawSelectRect(paper.project.getItems({selected:true, class:paper.Path}));
                this.setTool("lasso");
            }
        }   
    }

}



