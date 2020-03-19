document.getElementById("draw-btn").onclick = function(){tablica.setTool('draw');buttonGroup(this);};

document.getElementById("magneticLine-btn").onclick = function()
{
    if (isMagnetic)
    {
        tablica.setTool('magneticLine');
    }
    else
    {
        tablica.setTool('line');
    }
    buttonGroup(this);
};
document.getElementById("magneticEllipse-btn").onclick = function()
{
    if (isMagnetic)
    {
        tablica.setTool('magneticEllipse');
    }
    else
    {
        tablica.setTool('ellipse');
    }
    buttonGroup(this);
};


document.getElementById("magnet-btn").onclick = function()
{
    if (isMagnetic)
    {
        isMagnetic = false;
        document.getElementById("magnet-btn").children[0].style.display = "inline";
        document.getElementById("magnet-btn").children[1].style.display = "none";

        if (tablica.tool == "magneticLine")
        {
            tablica.setTool("line");
        }

        if (tablica.tool == "magneticEllipse")
        {
            tablica.setTool("ellipse");
        }
    }
    else
    {
        isMagnetic = true;
        document.getElementById("magnet-btn").children[0].style.display = "none";
        document.getElementById("magnet-btn").children[1].style.display = "inline";

        if (tablica.tool == "line")
        {
            tablica.setTool("magneticLine");
        }

        if (tablica.tool == "ellipse")
        {
            tablica.setTool("magneticEllipse");
        }
    }
};


document.getElementById("grid-btn").onclick = function()
{

	console.log(tablica.grid.visible);
    if (!tablica.grid.visible)
    {
        document.getElementById("grid-btn").children[1].style.display = "inline";
        document.getElementById("grid-btn").children[0].style.display = "none";

		tablica.grid.visible = true;
    }
    else
    {
        document.getElementById("grid-btn").children[1].style.display = "none";
        document.getElementById("grid-btn").children[0].style.display = "inline";
		tablica.grid.visible = false;
    }
};



document.getElementById("erase-btn").onclick = function(){tablica.setTool('erasePath');buttonGroup(this);};
document.getElementById("lasso-btn").onclick = function(){tablica.setTool('lasso');buttonGroup(this);};
document.getElementById("grab-btn").onclick = function(){tablica.setTool('grab');buttonGroup(this);};


document.getElementById("undo-btn").onclick = function(){tablica.undo()};
document.getElementById("redo-btn").onclick = function(){tablica.redo()};
document.getElementById("prev-btn").onclick = function()
{
    tablica.goToPreviousFrame();
document.getElementById("frame").innerHTML = tablica.currentFrame+1;
};
document.getElementById("next-btn").onclick = function()
{
   tablica.goToNextFrame();
   document.getElementById("frame").innerHTML = tablica.currentFrame+1;
};

document.getElementById("save-btn").onclick = function(){tablica.exportPathsAsHTML()};
document.getElementById("textfile").onchange= function(){tablica.loadHTMLFile(this)};
document.getElementById("load-btn").onclick = function(){tablica.importPathsFromHTML()};


/* COLOR */

document.getElementById("color-btn").onclick = function(){buttonShowInSubmenu(this,document.getElementById("submenu-color"))};

let colors = ["rgb(0,0,0)", "rgb(0,0,255)", "rgb(255,0,0)", "rgb(0,255,0)","rgb(255,255,0)","rgb(255,0,255)","rgb(0,255,255)"];
for (let i= 0;i<colors.length;i++)
{
    document.getElementById("submenu-color").innerHTML += "<div class = 'btn-color' id='color-choose-btn"+i+"'><img src = 'icons/blanck.png'></div>\n";
    document.getElementById("color-choose-btn"+i).style.background = colors[i];
    document.getElementById("color-choose-btn"+i).style.borderColor = colors[i];
}

for (let i= 0;i<colors.length;i++)
{
    document.getElementById("color-choose-btn"+i).onclick = function()
    {
        tablica.setColor(colors[i]);
        buttonHideSubmenu(this);
        document.getElementById("color-btn").style.background = colors[i];
    };
}

document.getElementById("color-btn").style.background = colors[0];

/* WIDTH */

document.getElementById("width-btn").onclick = function(){buttonShowInSubmenu(this,document.getElementById("submenu-width"))};

let widths = ["1", "1.5", "2", "3","4","5","6","8","10","12","16"];
for (let i= 0;i<widths.length;i++)
{
    let width = ""+Number(widths[i])*1;
    let svg = "<svg  height='20' width='100'> <line x1='15' y1='10' x2='85' y2='10' stroke-linecap='round' stroke='rgb(0,0,0)' stroke-width='"+width+"' /> </svg>";
    document.getElementById("submenu-width").innerHTML += "<p><div class = 'btn' id='width-choose-btn"+i+"'>"+svg+"</div></p>\n";
}

for (let i= 0;i<widths.length;i++)
{
    document.getElementById("width-choose-btn"+i).onclick = function()
    {

        buttonHideSubmenu(this);
        let width = ""+Number(widths[i])*1;
        tablica.setStrokeWidth(Number(widths[i]));
        let svg = "<svg  height='48' width='48'> <line x1='6' y1='24' x2='42' y2='24' stroke-linecap='round' stroke='rgb(0,0,0)' stroke-width='"+width+"' /> </svg>";

        document.getElementById("width-btn").innerHTML = svg;
    };
}
let width = ""+Number(widths[4])*1;
let svg = "<svg  height='48' width='48'> <line x1='6' y1='24' x2='42' y2='24' stroke-linecap='round' stroke='rgb(0,0,0)' stroke-width='"+width+"' /> </svg>";

document.getElementById("width-btn").innerHTML = svg;


/* dasharray */

document.getElementById("dasharray-btn").onclick = function(){buttonShowInSubmenu(this,document.getElementById("submenu-dasharray"))};

let dasharraysNumber = [[1,0],[5,5],[10,10],[15,15],[20,20],[1,10],[1,10,1,10,5,5]];
let dasharrayString = ["1 0", "5 5", "10 10", "15 15", "20 20", "1 10", "1 10 1 10 5 5"];
for (let i= 0;i<dasharrayString.length;i++)
{
    let svgDash = "<svg  height='20' width='100'> <line x1='15' y1='10' x2='85' y2='10' stroke-linecap='round' stroke='rgb(0,0,0)' stroke-width='3' stroke-dasharray='"+dasharrayString[i]+"' /> </svg>";
    document.getElementById("submenu-dasharray").innerHTML += "<p><div class = 'btn' id='dasharray-choose-btn"+i+"'>"+svgDash+"</div></p>\n";
}

for (let i= 0;i<dasharrayString.length;i++)
{
    document.getElementById("dasharray-choose-btn"+i).onclick = function()
    {

        buttonHideSubmenu(this);
        tablica.setStrokeDashArray(dasharraysNumber[i]);
        let svgDash = "<svg  height='48' width='96'> <line x1='6' y1='24' x2='90' y2='24' stroke-linecap='round' stroke='rgb(0,0,0)' stroke-width='3' stroke-dasharray='"+dasharrayString[i]+"' /> </svg>";
        document.getElementById("dasharray-btn").innerHTML = svgDash;
    };
}

let svgDash = "<svg  height='48' width='96'> <line x1='6' y1='24' x2='90' y2='24' stroke-linecap='round' stroke='rgb(0,0,0)' stroke-width='3' stroke-dasharray='"+dasharrayString[0]+"' /> </svg>";

document.getElementById("dasharray-btn").innerHTML = svgDash;


/* --------------------------------------------------------------- */

dragElement(document.getElementById("menuPanel"));

document.getElementById("menuPanelHeader").ondblclick = function()
{
showHide(document.getElementById("menuPanelBody"));
showHide(document.getElementById("info"));
};

document.getElementById("magnet-btn").children[0].style.display = "none";
document.getElementById("magnet-btn").children[1].style.display = "inline";

document.getElementById("grid-btn").children[0].style.display = "none";
document.getElementById("grid-btn").children[1].style.display = "inline";

let isMagnetic = true;


//



document.getElementById("btn-group").children[0].children[0].style.display = "none";
document.getElementById("btn-group").children[0].children[1].style.display = "inline";

for (let i = 1;i<document.getElementById("btn-group").childElementCount;i++)
{
    document.getElementById("btn-group").children[i].children[1].style.display = "none";
}

function buttonGroup(elem)
{
    parent = elem.parentElement;
    for (let i = 0;i<parent.childElementCount;i++)
    {
        if (parent.children[i] != elem)
        {
            parent.children[i].children[0].style.display = "inline";
            parent.children[i].children[1].style.display = "none";
        }
        else
        {
            elem.children[0].style.display = "none";
            elem.children[1].style.display = "inline";
        }
    }


}

function buttonShowInSubmenu(elem,submenu)
{
    submenu.style.top = ""+elem.getBoundingClientRect().bottom+"px";
    submenu.style.left = ""+elem.getBoundingClientRect().left+"px";
    submenu.style.display = "inline";
}
function buttonHideSubmenu(elem)
{
    elem.parentElement.style.display = "none";
}
