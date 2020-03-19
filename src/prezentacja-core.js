class Prezentacja extends Folia 
{


    cursorFollowPath = new paper.Path();
    
    cursorFollowPathPoints = [];

    playNextSlideWithAnimation()
    {
        this.strokeData[this.currentFrame] += 1;
        this.animateCurrentSlide();
        

    }


    makeBlanckScreen()
    {
        this.strokeData[this.currentFrame] = -1;
        this.showSlidesTillSlide(-1);
    }


    animateCurrentSlide()
    {

        let tempPaths = paper.project.getItems({strokeData: this.strokeData[this.currentFrame], class:paper.Path});
        this.getPointsSubpointsOnPaths(tempPaths);

        this.cursorFollowPath.removeSegments();
        
        /*
        for (let k = 0;k<this.cursorFollowPathPoints.length;k++)
        {
            this.cursorFollowPath.add(new paper.Point(this.cursorFollowPathPoints[k][0],this.cursorFollowPathPoints[k][1]));
        }
        */

        let cursor = this.cursor;
        cursor.visible = true;

        let cursorFollowPath = this.cursorFollowPath;

        let cursorFollowPathPoints = this.cursorFollowPathPoints; 

        let currentVursorFollowPoint = 0;
        let cursorFollowPathPointsLength = cursorFollowPathPoints.length;

        let j = 0; // path number

        cursorFollowPath.strokeWidth = tempPaths[j].strokeWidth;
        cursorFollowPath.strokeColor = tempPaths[j].strokeColor;
        cursorFollowPath.dashArray = tempPaths[j].dashArray;

        let isDrawing = false;

        this.showSlidesTillSlide(this.strokeData[this.currentFrame]-1);

        let strokeData = this.strokeData[this.currentFrame];

        cursor.onFrame = function(event)
        {
            cursor.visible = true;

            cursor.position =  new paper.Point(cursorFollowPathPoints[currentVursorFollowPoint][0], cursorFollowPathPoints[currentVursorFollowPoint][1]);
            
            
            if (cursorFollowPathPoints[currentVursorFollowPoint][2] && !isDrawing)
            {
                isDrawing = true;
                cursorFollowPath.removeSegments();

                cursorFollowPath.strokeWidth = tempPaths[j].strokeWidth;
                cursorFollowPath.strokeColor = tempPaths[j].strokeColor;
                cursorFollowPath.dashArray = tempPaths[j].dashArray;

            }

            if (cursorFollowPathPoints[currentVursorFollowPoint][2] && isDrawing)
            {
                cursorFollowPath.add(new paper.Point(cursorFollowPathPoints[currentVursorFollowPoint][0], cursorFollowPathPoints[currentVursorFollowPoint][1]));
            }

            if (!cursorFollowPathPoints[currentVursorFollowPoint][2] && isDrawing)
            {
                isDrawing = false;
                cursorFollowPath.removeSegments();
                tempPaths[j].visible = true;
                j++;
            }
            


            currentVursorFollowPoint++;

            if (currentVursorFollowPoint>=cursorFollowPathPointsLength)
            {
                paper.view.pause();
                cursorFollowPath.removeSegments();
                tempPaths[j].visible = true;
                strokeData++;
            }

        }
    }


    getPointsSubpointsOnPaths(tempPaths)
    {
        this.cursorFollowPathPoints = [];
       // let tempPaths = paper.project.getItems({strokeData: strokeData, class:paper.Path});
        

        let c = -1; // conection radius

        let dt = 0.5; // time step

        if (tempPaths.length == 0)
        {
            return null;
        }
        else if (tempPaths.length == 1)
        {
            this.cursorFollowPathPoints = this.getPointsSubpointsOnPath(tempPaths[0],0.2,true);
        }
        else
        {
            this.cursorFollowPathPoints = this.getPointsSubpointsOnPath(tempPaths[0],0.2,true);
            for (let i=1;i<tempPaths.length;i++)
            {
                this.cursorFollowPathPoints = this.cursorFollowPathPoints.concat(this.getPointsSubpointsOnPath(this.getConectionPath(tempPaths[i-1],tempPaths[i],c),dt,false));
                this.cursorFollowPathPoints = this.cursorFollowPathPoints.concat(this.getPointsSubpointsOnPath(tempPaths[i],dt,true));
            }
        }
    
        
    }


    getPointsSubpointsOnPath(path,dt,vis) //  0<dt<1 : time steps ; vis: visibility
    {
        let segmentsArray = path._segments;

        let subPoints = [];
       // let dt = 0.25;


        for (let k = 0;k<segmentsArray.length;k++)
        {
            let [b0x,b1x,b2x,b3x,b0y,b1y,b2y,b3y] = this.getBezierPoints(segmentsArray,k);
            for (let t = 0;t<1;t+=dt)
            {
                subPoints.push([this.getPositionOnBezierCurve(t,b0x,b1x,b2x,b3x),this.getPositionOnBezierCurve(t,b0y,b1y,b2y,b3y),vis]);
            }
        }

        return subPoints;
    }

    getConectionPath(startPath,endPath,c)
    {
        let hIn = new paper.Point(c*startPath.lastSegment._handleIn._x,c*startPath.lastSegment._handleIn._y);
        let hOut = new paper.Point(c*endPath.firstSegment._handleOut._x,c*endPath.firstSegment._handleOut._y);

        let from = new paper.Segment(startPath.lastSegment.point,hIn,hIn);
        let to = new paper.Segment(endPath.firstSegment.point,hOut,hOut);
    
        return new paper.Path([from,to]);   
    }

    setCursorFollorPathPoints()
    {
        this.cursorFollowPathPoints = [];

        let tempPaths = paper.project.getItems({strokeData:this.strokeData[this.currentFrame], class:paper.Path});



    }

    setCursorFollorPath()
    {

       

        this.cursorFollowPath.removeSegments();




        this.cursorFollowPath.strokeColor = "black";

        let tempPaths = paper.project.getItems({strokeData:this.strokeData[this.currentFrame], class:paper.Path});

        let c = -2; 

        if (tempPaths.length == 0)
        {

        }
        else if (tempPaths.length == 1)
        {
            for (let i=0;i<tempPaths.length;i++)
            {
                this.cursorFollowPath.join(tempPaths[i].clone());
            }
        }
        else
        {
            this.cursorFollowPath.join(tempPaths[0].clone());

            for (let i=1;i<tempPaths.length;i++)
            {

                /*
                let hIn = new paper.Point(c*tempPaths[i-1].lastSegment._handleIn._x,c*tempPaths[i-1].lastSegment._handleIn._y);
                let hOut = new paper.Point(c*tempPaths[i].firstSegment._handleOut._x,c*tempPaths[i].firstSegment._handleOut._y);

                let from = new paper.Segment(tempPaths[i-1].lastSegment.point,hIn,hIn);
                let to = new paper.Segment(tempPaths[i].firstSegment.point,hOut,hOut);
            
                let path = new paper.Path([from,to]);
                */
                let path = this.getConectionPath(tempPaths[i-1],tempPaths[i],c);  

                this.cursorFollowPath.join(path);
                this.cursorFollowPath.join(tempPaths[i].clone());
            }
        }


    }



    animateCurruentSlide()
    {
       
        /*
        let tempPaths = [];

        for (let i=0;i<this.frame._children.length;i++)
        {
            if (this.frame._children[i].strokeData == this.strokeData[this.currentFrame])
            {
                tempPaths.push(this.frame._children[i]);
                console.log(this.frame._children[i]);
            }
        }

        */
        this.showSlidesTillSlide(this.strokeData[this.currentFrame]);
        this.animatePaths(paper.project.getItems({strokeData:this.strokeData[this.currentFrame], class:paper.Path}));

    }

    getConectionPaths(paths)
    {
        let N = paths.length;

        let conectionPaths = [];

        if (N < 2 || N ==  null)
        {
            return null;
        }
        else
        {
            for (let k = 0;k < N-1;k++)
            {
                
                let c = -2;

                let hIn = new paper.Point(c*paths[k].lastSegment._handleIn._x,c*paths[k].lastSegment._handleIn._y);
                let hOut = new paper.Point(c*paths[k+1].firstSegment._handleOut._x,c*paths[k+1].firstSegment._handleOut._y);

                let from = new paper.Segment(paths[k].lastSegment.point,hIn,hIn);
                let to = new paper.Segment(paths[k+1].firstSegment.point,hOut,hOut);
        
                var path = new paper.Path([from,to]);

                conectionPaths.push(path);
            }
            return conectionPaths;   
        }

    }

    getBezierPoints(segmentsArray,i)
    {
        let b0x,b1x,b2x,b3x,hB1x,hB2x , b0y,b1y,b2y,b3y,hB1y,hB2y;

        b0x = segmentsArray[i].point._x;

        try 
        {
            hB1x =  segmentsArray[i]._handleOut._x;
        }
        catch (e) 
        {
            hB1x = 0;
        }

        try 
        {
            hB2x = segmentsArray[i+1]._handleIn._x;
        }
        catch (e) 
        {
            hB2x = 0;
        }

        try 
        {
            b3x =  segmentsArray[i+1].point._x;
        }
        catch (e) 
        {
            b3x = b0x;
        }
        b1x = b0x+hB1x;
        b2x = b3x+hB2x;
        
        b0y = segmentsArray[i].point._y;
        try 
        {
            hB1y =  segmentsArray[i]._handleOut._y;
        }
        catch (e) 
        {
            hB1y = 0;
        }

        try 
        {
            hB2y = segmentsArray[i+1]._handleIn._y;
        }
        catch (e) 
        {
            hB2y = 0;
        }
        
        try 
        {
            b3y =  segmentsArray[i+1].point._y;
        }
        catch (e) 
        {
            b3y = b0y;
        }
        
        b1y = b0y+hB1y;
        b2y = b3y+hB2y;
        
        return [b0x,b1x,b2x,b3x,b0y,b1y,b2y,b3y];
    }


    /*
    getBezierPoints(segmentsArray,i,coord)
    {
        let b0,b1,b2,b3,hB1,hB2;
        if (coord=="x")
        {
          
            b0 = segmentsArray[i].point._x;


            try 
            {
                hB1 =  segmentsArray[i]._handleOut._x;
            }
            catch (e) 
            {
                hB1 = 0;
            }

            try 
            {
                hB2 = segmentsArray[i+1]._handleIn._x;
            }
            catch (e) 
            {
                hB2 = 0;
            }

            try 
            {
                b3 =  segmentsArray[i+1].point._x;
            }
            catch (e) 
            {
                b3 = b0;
            }
            b1 = b0+hB1;
            b2 = b3+hB2;
        }
        else if (coord=="y")
        {
            b0 = segmentsArray[i].point._y;
            try 
            {
                hB1 =  segmentsArray[i]._handleOut._y;
            }
            catch (e) 
            {
                hB1 = 0;
            }

            try 
            {
                hB2 = segmentsArray[i+1]._handleIn._y;
            }
            catch (e) 
            {
                hB2 = 0;
            }
            
            try 
            {
                b3 =  segmentsArray[i+1].point._y;
            }
            catch (e) 
            {
                b3 = b0;
            }
            
            b1 = b0+hB1;
            b2 = b3+hB2;
        }
        return [b0,b1,b2,b3];
    }

    */

    getPositionOnBezierCurve(t,b0,b1,b2,b3)
    {
        return (-b0+3*b1-3*b2+b3)*t*t*t+(3*b0-6*b1+3*b2)*t*t+(-3*b0+3*b1)*t+b0;
    }

    animatePaths(tempPaths) // tempPaths: Array of paper.Path's 
    {

        if (tempPaths.length == 0)
        {
            return null;
        }


        let conectionPaths = this.getConectionPaths(tempPaths);
        let paths = [];
    
        for (let j = 0;j<tempPaths.length-1;j++)
        {
            paths.push(tempPaths[j]);
            paths.push(conectionPaths[j]);
        }
        paths.push(tempPaths[tempPaths.length-1]);

        let t = 0;
        let i = 0;
        let k = 0;  
        
        let L = paths.length;

        
        
        if (L == 0)
        {
            return null;
        }
        //in paths[k].onFrame ist "this" kein Tablica-Objekt

        let convertToSimplePath = this.convertToSimplePath; 
        let getPositionOnBezierCurve = this.getPositionOnBezierCurve;
        let getBezierPoints =  this.getBezierPoints;
        let simplePath = convertToSimplePath(paths[k]);
        
        let currentColor = this.currentColor;
        
        let segmentsArray = paths[k].segments;     
    
        let N = segmentsArray.length-1;
        let xPos,yPos;

        try 
        {
            xPos = segmentsArray[i].point._x;
            yPos = segmentsArray[i].point._y;
        }
        catch (e) 
        {
            xPos = 0;
            yPos = 0;
        }
        let dt = 0.334;
        //let dt = 0.1;
      

        let cursor = this.cursor;
        cursor.visible = true;

        for (let j = 0;j<L;j++)
        {
            paths[j].visible = false;
        }

        let tempPath = new paper.Path();
        tempPath.strokeColor = simplePath.color;
        if (simplePath.color != null)
        {
            cursor.fillColor = simplePath.color;
        } 
        else
        {
            cursor.fillColor = currentColor;
        }
        tempPath.strokeWidth = simplePath.width;

        paths[k].onFrame =  function(event)
        { 
           // if (event.count % 2 === 0)
            {
                cursor.visible = true;
                let b0 = 0;
                let b1 = 0;
                let b2 = 0;
                let b3 = 0;   
                
            
                try
                {
                    [b0,b1,b2,b3] =  getBezierPoints(segmentsArray,i,"x");
                    xPos = getPositionOnBezierCurve(t,b0,b1,b2,b3);

                    [b0,b1,b2,b3] =  getBezierPoints(segmentsArray,i,"y");

                    yPos = getPositionOnBezierCurve(t,b0,b1,b2,b3);

                    tempPath.add(new paper.Point(xPos,yPos));

                    cursor.position =  new paper.Point(xPos, yPos);
        
                    t +=dt;
                }
                catch(e)
                {
                    t = 1;
                //    i = i+1;
                    console.log("conection path error");
                    console.log("k = "+ k);
                    console.log("i = "+i);
                }    
            
                
                if (t >1)
                {
                    t = 0;
                    i = i+1;
                
                    if (i >= N)
                    {
                        paths[k].visible = true;  
                        k += 1;
                        if (k < L)
                        {                      
                            simplePath = convertToSimplePath(paths[k]);
                            segmentsArray = paths[k].segments;
                            N = segmentsArray.length-1;
                            t = 0;
                            i = 0;

                            xPos = segmentsArray[i].point._x;
                            yPos = segmentsArray[i].point._y;

                            tempPath.remove();

                            tempPath = new paper.Path();
                            tempPath.strokeColor = simplePath.color;
                        
                            if (simplePath.color != null)
                            {
                                cursor.fillColor = simplePath.color;
                            } 
                            else
                            {
                                cursor.fillColor = currentColor;
                            }
                            tempPath.strokeWidth = simplePath.width;
                        }
                        else
                        {
                            paper.view.pause();
                            cursor.visible = false;
                            tempPath.remove();
                            cursor.fillColor = currentColor;
                        }
                    }
                }     
            }

        }
        
    }



}