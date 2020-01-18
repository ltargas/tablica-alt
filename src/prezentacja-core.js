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

class Prezentacja extends Tablica 
{

    makeTestSegmentArray()
    {
        let p1 = new paper.Point(120,120);
        let hIn1 = new paper.Point(0,120);
        let hOut1 = new paper.Point(60,60);
        let s1 = new paper.Segment(p1,hIn1,hOut1);
        
        let p2 = new paper.Point(300,140);
        let hIn2 = new paper.Point(0,120);
        let hOut2 = new paper.Point(-30,-60);
        let s2 = new paper.Segment(p2,hIn2,hOut2);

        
        let p3 = new paper.Point(300,340);
        let hIn3 = new paper.Point(0,120);
        let hOut3 = new paper.Point(30,60);
        let s3 = new paper.Segment(p3,hIn3,hOut3);
        

        return [s1,s2,s3];
    }

    makeTestPath()
    {
        let p1 = new paper.Point(120,120);
        let hIn1 = new paper.Point(0,120);
        let hOut1 = new paper.Point(60,60);
        let s1 = new paper.Segment(p1,hIn1,hOut1);
    /*
        let in1 = new paper.Point(p1.x+hIn1.x,p1.y+hIn1.y);
        let out1 = new paper.Point(p1.x+hOut1.x,p1.y+hOut1.y);
*/

        let p2 = new paper.Point(300,140);
        let hIn2 = new paper.Point(0,120);
        let hOut2 = new paper.Point(-30,-60);
        let s2 = new paper.Segment(p2,hIn2,hOut2);
/*
        let in2 = new paper.Point(p2.x+hIn2.x,p2.y+hIn2.y);
        let out2 = new paper.Point(p2.x+hOut2.x,p2.y+hOut2.y);
*/
/*
        let tIn1 = new paper.Path(p1,in1);
        tIn1.strokeColor = "red";
        tIn1.strokeWidth = 3;

        let tOut1 = new paper.Path(p1,out1);
        tOut1.strokeColor = "blue";
        tOut1.strokeWidth = 3;

        let tIn2 = new paper.Path(p2,in2);
        tIn2.strokeColor = "green";
        tIn2.strokeWidth = 3;

        let tOut2 = new paper.Path(p2,out2);
        tOut2.strokeColor = "yellow";
        tOut2.strokeWidth = 3;
*/

        
        let p3 = new paper.Point(300,340);
        let hIn3 = new paper.Point(0,120);
        let hOut3 = new paper.Point(30,60);
        let s3 = new paper.Segment(p3,hIn3,hOut3);
        

        let test = new paper.Path();
        test.segments=[s1,s2,s3];
        test.strokeColor = "black";
        test.strokeWidth = 3;
        return test;


    }

    animatePath(path) // segmentsArray: Array of Path Segments
    {

        let simplePath = this.convertToSimplePath(path);
        let segmentsArray = path.segments;
        let t = 0;
        let i = 0;
        let N = segmentsArray.length-1;

        let xPos = segmentsArray[i].point._x;
        let yPos = segmentsArray[i].point._y;

        let cursor = new paper.Path.Rectangle(new paper.Point(xPos, yPos), new paper.Size(this.cursorSize,this.cursorSize));
        cursor.strokeColor = 'black';
        cursor.fillColor = 'black';
        cursor.shadowColor = "black";
        cursor.shadowBlur = 10;

        path.visible = false;
 
        let tempPath = new paper.Path();
        tempPath.strokeColor = simplePath.color;
        tempPath.strokeWidth = simplePath.width;

        paper.view.onFrame =  function(event) 
        {
            let b0,b1,b2,b3,hB1,hB2;

            b0 = segmentsArray[i].point._x;
            hB1 =  segmentsArray[i]._handleOut._x;
            hB2 = segmentsArray[i+1]._handleIn._x;
            b3 =  segmentsArray[i+1].point._x;
            b1 = b0+hB1;
            b2 = b3+hB2;
            
            xPos = (-b0+3*b1-3*b2+b3)*t*t*t+(3*b0-6*b1+3*b2)*t*t+(-3*b0+3*b1)*t+b0;

            b0 = segmentsArray[i].point._y;
            hB1 =  segmentsArray[i]._handleOut._y;
            hB2 = segmentsArray[i+1]._handleIn._y;
            b3 =  segmentsArray[i+1].point._y;
            b1 = b0+hB1;
            b2 = b3+hB2;
            
            yPos = (-b0+3*b1-3*b2+b3)*t*t*t+(3*b0-6*b1+3*b2)*t*t+(-3*b0+3*b1)*t+b0;

           
            tempPath.add(new paper.Point(xPos,yPos));

            cursor.position =  new paper.Point(xPos, yPos);

            t +=0.2;
            
            if (t > 1)
            {
                t = 0;
                i = i+1;
                if (i == N)
                {
                    paper.view.pause();
                    cursor.remove();
                    tempPath.remove();
                    path.visible = true;
                }
            }
           // tempPath.remove();
           // path.visible = true;
            
        }
        console.log("bla");
    }

}