class Prezentacja extends Tablica 
{

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

 /*
    getDeltaT(x,y)
    {
        let BL = Math.sqrt( (x[1] - x[0])*(x[1] - x[0]) + (y[1] - y[0])*(y[1] - y[0]) ) +  Math.sqrt( (x[2] - x[1])*(x[2] - x[1]) + (y[2] - y[1])*(y[2] - y[1]) ) +  Math.sqrt( (x[3] - x[2])*(x[3] - x[2]) + (y[3] - y[2])*(y[3] - y[2]) );
        
        
        if (BL > 200)
        {
            return 0.05;
        }
        if (BL > 100)
        {
            return 0.1;
        }

        if (BL > 50)
        {
            return 0.2;
        }

        if (BL > 10)
        {
            return 0.25;
        }


        return 1.0;
    }
*/

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
        let dt = 0.25;
      

        let cursor = this.cursor;
        cursor.visible = true;

        for (let j = 0;j<L;j++)
        {
            paths[j].visible = false;
        }

        let tempPath = new paper.Path();
        tempPath.strokeColor = simplePath.color;
        tempPath.strokeWidth = simplePath.width;

        paths[k].onFrame =  function(event) 
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
           
            
            if (t >0.95)
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
                        tempPath.strokeWidth = simplePath.width;
                    }
                    else
                    {
                        paper.view.pause();
                        cursor.visible = false;
                        tempPath.remove();
                    }
                }
            }     
        }
        
    }



}