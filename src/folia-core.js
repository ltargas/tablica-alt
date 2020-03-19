class Folia extends Tablica 
{
    setSlideNumber(slideNumber)
    {
        for (let i=0;i<this.frame._children.length;i++)
        {
            if (this.frame._children[i].selected)
            {
                this.frame._children[i].strokeData = slideNumber;
            }
        }
    }

    showSlidesTillSlide(slide)
    {
        for (let i=0;i<this.frame._children.length;i++)
        {
            if (this.frame._children[i].strokeData <=slide)
            {
                this.frame._children[i].visible = true;
            }
            else
            {
                this.frame._children[i].visible = false;
            }
        }

    }

    nextSlide()
    {
        this.strokeData[this.currentFrame] += 1;

        let tempPaths = paper.project.getItems({selected:true, class:paper.Path});

        for (let i = 0;i<tempPaths.length;i++)
        {
            tempPaths[i].strokeData = this.strokeData[this.currentFrame];
        }

        this.showSlidesTillSlide(this.strokeData[this.currentFrame]);
    }        

    previosSlide()
    {
        if (this.strokeData[this.currentFrame] > 0)
        {

            let tempPaths = paper.project.getItems({selected:true, class:paper.Path});

            for (let i = 0;i<tempPaths.length;i++)
            {
                tempPaths[i].strokeData = this.strokeData[this.currentFrame];
            }

            this.strokeData[this.currentFrame] -= 1;
            this.showSlidesTillSlide(this.strokeData[this.currentFrame]);
        }
    }
    
}