

let alphabet = [..."abcdefghijklmnopqrstuvwxyz"]
let innerpadding = 100
let width = window.innerWidth + innerpadding
let height = window.innerHeight + innerpadding

let widthScale = d3.scaleLinear()
                .domain([0,width]) //should be 30 max for num of alphabet
                .range([0,width])

let ydistance = 30 // vertical distance between two lines
let xdistance = 50 // horizontal distance between points
let leftletterstart = 20
let leftaxispadding = 20     
let axisleft = leftaxispadding + leftaxispadding   //x axis starts here      

let inputtext = "how are you?"

let dotradius = 10 //circle radius on the point

//to clear them when required, especially with every new input
let linehistory = []
let dothistory = []
var datapoints = []

let canvas = null //to draw axes
let g = null // to draw graphs

window.onload = ()=>{
    canvas = d3.select("body")
        .append("svg")
        .attr("width",width)
        .attr("height",height)
        .style("border","1px solid red")
    
    
    setListener()

    init()
}

window.onresize = ()=>{
    width = window.innerWidth
    height = window.innerHeight
    //console.log(width, height)
    clearCanvas()

    let input = document.getElementById("input")
    handleChange(input)
}
function setListener(){
    let input = document.getElementById("input")
    let radio = document.getElementById("radio")

    input.oninput = (e)=>{
        handleChange(input)
    }

    radio.onchange = (e)=>{
        handleChange(input)
    }

   /*  document.onkeyup = (e)=>{
        if(e.key == "Escape")  removeFloatingButton()
    } */

}
function handleChange(input){
    let val = input.value.trim()
    
    clearCanvas()
    datapoints = [] //reset

    //draw new svg
    if(val.length>0) createGraphFromText(val)
}


function init(){
    prepareCanvas()
}

function prepareCanvas(){
    let letters = canvas.selectAll("text")
        .data(alphabet)
        .enter()
        .append("text") //add letter
        .attr("x", leftletterstart)
        .attr("y", function(d,i){return ydistance + i*ydistance})
        //.attr('text-anchor', 'middle')
        .attr("class", "myLabel")//easy to style with CSS
        .text(function(d){return d})

    let lines = canvas.selectAll("line")//empty lines
        .data(alphabet)//bind data
        .enter() //create placeholder for every value in data
        .append("line")
        .attr("stroke","gray")
        .style("stroke-dasharray", ("3, 3"))
        .attr("x1", axisleft)
        .attr("y1", function(d,i){return ydistance + i*ydistance})
        .attr("x2", width)
        .attr("y2", function(d,i){return ydistance + i*ydistance})
               
    //initiate group at the end
    //because it should be at the forefront of the lines
    g = canvas.append("g")


}
function createGraphFromText(inputtext){
    let data = numericalizerText(inputtext)
    let dpoints = getDatapointsFromTextData(data)
    
    //here you need to draw label for each dpoints
    drawPoints(dpoints)
    drawConnectingLines(dpoints)

}

function drawConnectingLines(dpoints){
    let lineid = "id" + Math.random().toString(16).slice(2)

    //make a few chunks so that the points appear to be connected in chunks
    let dpchunks = getInChunks(dpoints)
    dpchunks.forEach(dcpoints =>{ //it is asynchronous, desirable in this case
        //skip first point
        let dpairs = getDatapointPairs(dcpoints)

        g.selectAll("line.cline")
        .data(dpairs)
        .enter()
        .append("line")
        .attr("stroke","green")
        .attr("x1", function(d){return d[0].point.x})
        .attr("y1", function(d,i){return d[0].point.y})
        .attr("x2", function(d){return d[1].point.x})
        .attr("y2", function(d,i){return d[1].point.y})
        .attr("id", lineid)
    })
    
}

//chunk array into subarrays
//default number for each chunk is 5
function getInChunks(array, chunksize = 5){
    let chunks = []
    for (let i = 0; i < array.length; i += chunksize) {
        const chunk = array.slice(i, i + chunksize)
        chunks.push(chunk)
    }
    return chunks
}

function drawPoints(dpoints){
    let pointid = "id" + Math.random().toString(16).slice(2)
    
    g.selectAll("circle")
    .data(dpoints)
    .enter()
    .append('circle')
    .attr("cx", function(d){ return d.point.x})
    .attr("cy", function(d){return d.point.y})
    .attr('r', dotradius)
    .attr('stroke', 'green')
    .attr('fill', "green")
    .attr("id", pointid)   

    // also draw label
    g.selectAll("text.label")
    .data(dpoints)
    .enter()
        .append("text")
        .attr("x", function(d){ return d.point.x})
        .attr("y", function(d, i){return i % 2 == 0 ? d.point.y-ydistance: d.point.y+ydistance}) //-(ydistance/10)
        .attr('text-anchor', 'middle')
        .attr("class", "label")//easy to style with CSS
        .attr("stroke","red")
        .text(function(d){return d.label})
    dothistory.push(pointid)
}

function drawLineFromDPointpairs(dpointpairs, canvas){
    //create line
    let dotradius = 10
    for(let i=0; i<dpointpairs.length; i++){
        console.log(dpointpairs[i][0])
        let nline = new Line(dpointpairs[i][0].point, dpointpairs[i][1].point, canvas, "green")
        nline.drawLine()
        linehistory.push(nline.id)

        //create dot
        let dot = new Circle(dpointpairs[i][0].point, dotradius, canvas, "green", "green")
        dot.drawCircle()
        dothistory.push(dot.id)

        //draw the ending dot
        if(i == dpointpairs.length-1) {
            let dot = new Circle(dpointpairs[i][1].point, dotradius, canvas, "green", "green")
            dot.drawCircle()
            dothistory.push(dot.id)
        }
    }
    
}

//datapoint{index, word, letter, point} !
function getDatapointPairs(datapoints){
    //create datapoint pairs
    //we need at leas two datapoints!
    if(datapoints.length < 1) {
        console.log("at least 2 datapoints needed to make a line!")
        return
    }
    
    let dpointpairs = []
    for(let i=0; i<datapoints.length; i++){
        if(i>0){
            dpointpairs.push([datapoints[i-1], datapoints[i]])
        }
    }
    
    return dpointpairs
}
function getDatapointsFromTextData(data){

    let dpoints = []
    
    //assign Point for each letter
    for(let i=0; i<data.length; i++){
        let x = i*xdistance + xdistance + axisleft
        let y = data[i].index * ydistance + ydistance
        data[i].point = new Point(x, y) 
        dpoints.push(data[i].point)
    }
    return data
}

function numericalizerText(text){
    let words = text.split(" ")

    let data = []
    for(let i=0; i<words.length; i++){
        let word = words[i]
        let modword = preProcessData(word) //processed version of the word
        let x = 0
        while(x < modword.length){
            let xchar = modword[x]
            if(alphabet.includes(xchar)){
                data.push({
                    label:word, //keep original word
                    word: modword, //use processed word for calculation
                    letter: xchar,
                    index: alphabet.indexOf(xchar)
                })
                break
            }
            x++
        }
        
    }

    return data
}

function preProcessData(text){
    //strip all whitespace
    //text = text.split(" ").join("").toLowerCase()
    text = text.toLowerCase()

    //replace pali and pinyin characters
    text = text.replace(/[āáǎà]/ig, 'a') //ēéěè 
    text = text.replace(/[īíǐì]/ig, 'i') //ōóǒò 
    text = text.replace(/[ūúǔùǖǘǚǜü]/ig, 'u')
    text = text.replace(/[ēéěè]/ig, 'e')
    text = text.replace(/[ōóǒò]/ig, 'o')
    
    text = text.replace(/ṭ/ig, 't')
    text = text.replace(/ḍ/ig, 'd')
    text = text.replace(/ṇ/ig, 'n')
    text = text.replace(/ṅ/ig, 'ng')
    text = text.replace(/ñ/ig, 'ny')
    text = text.replace(/ṃ/ig, 'ng')
    text = text.replace(/ḷ/ig, 'l')
    return text
}

function clearCanvas(){
    
    /* for(let i=0; i<linehistory.length; i++){
        d3.select("#"+linehistory[i]).remove()
    }
    for(let i=0; i<dothistory.length; i++){
        let dot = document.getElementById(dothistory[i])
        if(dot) dot.parentElement.removeChild(dot)
    } */
    d3.select("g").selectAll("*").remove()
    
}

//It resizes the bars with windows resize
function visualizeAlphabet(){
    let dataArray = [20,30,40,50]

    let canvas = d3.select("body")
                .append("svg")
                .attr("width",width)
                .attr("height",height)
                .style("border","1px solid red")
    let bars = canvas.selectAll("rect")//bars are rectangles
                //empty array of rectangles
                .data(dataArray)//bind data
                .enter() //create placeholder for every value in data
                    .append("rect")
                    .attr("width", function(d){return widthScale(d*width*0.01)})
                    .attr("height", 50)
                    .attr("y", function(d, i){return i*100})


}

function shapescreation(){
    d3.select("body").append("p").text("Hi, what's up?")

    d3.select("p")
        .append("p")
        .style("color", "red")
        .attr("id","pid")
        .text("This is second p!")

    let canvas = d3.select("body")
                    .append("svg")
                    .attr("width", window.innerWidth)
                    .attr("height", window.innerHeight)
                    .style("border", "1px solid red")

    let circle = canvas.append("circle")
                    .attr("cx", 250)
                    .attr("cy", 250)
                    .attr("r", 50)
                    .style("fill", "red")
    
    let rect = canvas.append("rect")
                    .attr("width", 100)
                    .attr("height", 50)

    let line = canvas.append("line")
                    .attr("x1",0)
                    .attr("y1",100)
                    .attr("x2",400)
                    .attr("y2",400)
                    .attr("stroke","green")
                    .attr("stroke-width",10)
    
        
}


function visualizeData(){
    let dataArray = [20,40,50]

    let canvas = d3.select("body")
                .append("svg")
                .attr("width",500)
                .attr("height",500)
                .style("border","1px solid red")
    let bars = canvas.selectAll("rect")//bars are rectangles
                //empty array of rectangles
                .data(dataArray)//bind data
                .enter() //create placeholder for every value in data
                    .append("rect")
                    .attr("width", function(d){return d*10})
                    .attr("height", 50)
                    .attr("y", function(d, i){return i*100})


}
