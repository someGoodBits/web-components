class CircularProgressbar extends HTMLElement{

    constructor(){
        super();
        this.shadowDom = this.attachShadow({mode:"open"});
    }
    
    validateAttributes(){
        this.angle = parseInt(this.getAttribute("angle")) || 0;
        this.size  = parseInt(this.getAttribute("size"))  || 200;
        this.gap   = parseInt(this.getAttribute("gap"))   || 0;
        this.stroke = this.getAttribute("color") || "hsl(220,75%,70%)" ;
        this.strokeTrack = this.getAttribute("track-color") || "#eee" ;
        this.strokeWidth = parseInt(this.getAttribute("width")) || 4 ;
        this.min = parseInt(this.getAttribute("min")) || 0 ;
        this.max = parseInt(this.getAttribute("max")) || 100 ;
        this.value = parseInt(this.getAttribute("value")) || this.min ;
        this.angle += this.gap/2 + 90;
        while(this.angle < 0) 
            this.angle += 360 ;
        if(this.size < 100) 
            this.size = 100 ;
        this.gap %= 360 ;
        
        if(this.max < this.min){
            this.max = this.min ;
        }
        
        if(this.value < this.min || this.value > this.max){
            this.value = this.min ;
        }
    }
    
    connectedCallback(){
        // load all attributes
        this.validateAttributes();
    
        // component wrapper
        let wrapper = document.createElement("div");
        wrapper.setAttribute("class","wrapper") ;
        
        // svg element
        let svgNS = "http://www.w3.org/2000/svg";
        let svg = document.createElementNS(svgNS,"svg");
        
        svg.style.width  = (this.size + this.strokeWidth/2) + "px";
        svg.style.height = (this.size + this.strokeWidth/2) + "px";
        
        // track element
        let rad = this.size * 0.5 - 8 ;
        this.radius = rad ;
        let meter = document.createElementNS(svgNS,"circle");
        meter.style.stroke = this.strokeTrack;
        meter.setAttribute("class","meter");
        meter.setAttribute("cx","50%");
        meter.setAttribute("cy","50%");
        meter.setAttribute("r",this.radius);
        
        // meter element
        let arc = document.createElementNS(svgNS,"circle");
        arc.setAttribute("class","arc");
        arc.style.stroke = this.stroke;
        arc.setAttribute("cx","50%");
        arc.setAttribute("cy","50%");
        arc.setAttribute("r",this.radius);
        this.arc = arc ;
        
        // display
        let display = document.createElement("div");
        display.classList.add("display");
        this.counter = new Counter(display,this.value,800);
        


        //set arc properties
        let arcFraction = (360-this.gap) / 360 ;
        this.arcLength = arcFraction*(2*Math.PI*this.radius)
        arc.style.strokeDasharray = meter.style.strokeDasharray = this.arcLength + "px , " + (2*Math.PI*this.radius) + "px" ;
        arc.style.strokeDashoffset = 0 ;
        
        svg.style.transform = `rotate(${this.angle}deg)`;


        // styles
        let styleElement = document.createElement("style") ;
        styleElement.innerHTML = `
            .wrapper {
                position:relative;
                width  : ${this.offsetWidth  + "px"};
                height : ${this.offsetHeight + "px"};
                min-width  : ${2.5*this.radius}px ;
                min-height : ${2.5*this.radius}px ;
                display:flex;
                align-items:center;
                justify-content:center;
            }
            .arc,.meter {
                fill: none ;
                transition : all 1s ease-out ;
                stroke-linecap : round ;
                stroke-width:${this.strokeWidth}px;
            }

            .arc {
                stroke-width : ${this.strokeWidth+1}px ;
            }
            .display {
                position:absolute;
                top:50%;
                left:50%;
                transform :translate(-50%,-50%);
                font-size:4rem;
                color:${this.stroke};
                font-weight:900;
            }
        `;

        // append elements to dom
        svg.appendChild(meter);
        svg.appendChild(arc);
        wrapper.appendChild(svg);
        wrapper.appendChild(display);
        this.shadowDom.appendChild(styleElement);
        this.shadowDom.appendChild(wrapper);

        this.setValue(this.value);
    }

    setValue(value){
        value = Math.min(this.max,Math.max(this.min,value));
        let v = Math.abs((value - this.min) / (this.max - this.min));
        
        v = (v>1)?1:v;
        v = (v<0)?0:v;

        this.counter.setCount(value);
        
        let val = (this.arcLength * (1-v)) ;
        this.arc.style.strokeDashoffset = val + "px";
        
    }

}

// register web componemt
customElements.define(
    "circular-progressbar",
    CircularProgressbar
);
