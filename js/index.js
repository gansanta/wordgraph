

let alphabet = [..."abcdefghijklmnopqrstuvwxyz"]
let numbers = [..."0123456789"]
let innerpadding = 100
let width = window.innerWidth + innerpadding
let height = window.innerHeight + innerpadding

let widthScale = d3.scaleLinear()
                .domain([0,width]) //should be 30 max for num of alphabet
                .range([0,width])
let ydistance = 20 // vertical distance between two lines
let xdistance = 50 // horizontal distance between points
let leftletterstart = 20
let leftaxispadding = 20     
let axisleft = leftaxispadding + leftaxispadding   //x axis starts here   

let vgraphdistance = (labelarray)=>{
    return (labelarray.length+2)*ydistance
} 

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
    clearCanvas()

    let input = document.getElementById("input")
    handleChange(input)
}
function setListener(){
    let input = document.getElementById("input")
    let radio = document.getElementById("radio")
    let chunk = document.getElementById("chunk")
    let chunkvalue = document.getElementById("chunkvalue")

    input.oninput = (e)=>{
        handleChange(input)
    }

    radio.onchange = (e)=>{
        handleChange(input)
    }
    
    chunk.oninput = ()=>{
        chunkvalue.innerHTML = chunk.value
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

    //here I should clear whole svg and add new one
    //and then determine the input type
    let isNumber = isAllNumbers(val) //check if it is only numbers! eg: digits in pie!
    //and provide it from here
    prepareCanvas(isNumber)
    //draw new svg
    if(val.length>0) createGraphFromText(val, isNumber)
}


function init(){
    prepareCanvas()
}

function prepareCanvas(isNumber=false){
    if(isNumber) drawAxes(numbers)
    else drawAxes(alphabet) 
           
    //initiate group at the end
    //because it should be at the forefront of the lines
    g = canvas.append("g")


}

function drawAxes(labelarray){
    let labels = canvas.selectAll("text")
        .data(labelarray)
        .enter()
        .append("text") //add letter
        .attr("x", leftletterstart)
        .attr("y", function(d,i){return ydistance + i*ydistance})
        //.attr('text-anchor', 'middle')
        .attr("class", "myLabel")//easy to style with CSS
        .text(function(d){return d})

    let labels2 = canvas.selectAll("text.below")
        .data(labelarray)
        .enter()
        .append("text") //add letter
        .attr("x", leftletterstart)
        .attr("y", function(d,i){return vgraphdistance(labelarray)+ydistance + i*ydistance})
        //.attr('text-anchor', 'middle')
        .attr("class", "myLabel")//easy to style with CSS
        .text(function(d){return d})

    //draw horizontal lines
    let lines = canvas.selectAll("line")//empty lines
        .data(labelarray)//bind data
        .enter() //create placeholder for every value in data
        .append("line")
        .attr("stroke","gray")
        .style("stroke-width", function(d,i){return i == Math.ceil(labelarray/2) ? "3": i%3 == 0 ? "1": "0.25"} )
        //.style("stroke-dasharray", ("3, 3"))
        .attr("x1", axisleft)
        .attr("y1", function(d,i){return ydistance + i*ydistance})
        .attr("x2", width)
        .attr("y2", function(d,i){return ydistance + i*ydistance})

        //draw hlines below it again
    let lines2 = canvas.selectAll("line.horizontal")//empty lines
        .data(labelarray)//bind data
        .enter() //create placeholder for every value in data
        .append("line")
        .attr("stroke","gray")
        .style("stroke-width", function(d,i){return i == Math.ceil(labelarray/2) ? "3": i%3 == 0 ? "1": "0.25"} )
        //.style("stroke-dasharray", ("3, 3"))
        .attr("x1", axisleft)
        .attr("y1", function(d,i){return vgraphdistance(labelarray)+ ydistance + i*ydistance})
        .attr("x2", width)
        .attr("y2", function(d,i){return vgraphdistance(labelarray)+ydistance + i*ydistance})

   
}

function createGraphFromText(inputtext, isNumber = false){
    let data = null
    
    let labelarray = alphabet //default

    if(isNumber){
        labelarray = numbers
        //if numbers, split and put space and join them by putting space 
        let predata = inputtext.split("").join(" ")
        data = numericalizerText(predata, true)
    }
    else data = numericalizerText(inputtext)
    
    //returns data with added point property
    let dpoints = getDatapointsFromTextData(data,labelarray)
    
    //here you need to draw label for each dpoints
    drawPoints(dpoints,labelarray)
    drawConnectingLines(dpoints)

}

function drawConnectingLines(dpoints){
    let lineid = "id" + Math.random().toString(16).slice(2)
    let lineid2 = "id" + Math.random().toString(16).slice(2)

    //make a few chunks so that the points appear to be connected in chunks
    let chunksize = document.getElementById("chunk").value

    let dpchunks = getInChunks(dpoints, parseInt(chunksize))
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

        if(dpoints[0].mpoint){
            g.selectAll("line.cline")
            .data(dpairs)
            .enter()
            .append("line")
            .attr("stroke","green")
            .attr("x1", function(d){return d[0].mpoint.x})
            .attr("y1", function(d,i){return d[0].mpoint.y})
            .attr("x2", function(d){return d[1].mpoint.x})
            .attr("y2", function(d,i){return d[1].mpoint.y})
            .attr("id", lineid2)
        }
    })
    
}

//chunk array into subarrays
//default number for each chunk is 5
function getInChunks(array, chunksize = 5){
    //avoiding future disaster
    if(!chunksize || chunksize <= 0) chunksize = 5
    let chunks = []
    
    for (let i = 0; i < array.length; i += chunksize) {
        const chunk = array.slice(i, i + chunksize)
        chunks.push(chunk)
        
    }
    
    return chunks
}

function drawPoints(dpoints,labelarray){
    let pointid = "id" + Math.random().toString(16).slice(2)
    let mpointid = "id" + Math.random().toString(16).slice(2)
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

    //meaning points
    if(dpoints[0].mpoint){
        g.selectAll("circle.meaning")
        .data(dpoints)
        .enter()
        .append('circle')
        .attr("cx", function(d){ return d.mpoint.x})
        .attr("cy", function(d){return d.mpoint.y})
        .attr('r', dotradius)
        .attr('stroke', 'green')
        .attr('fill', "green")
        .attr("id", mpointid)   
    }
   

    // also draw label
    g.selectAll("text.label")
    .data(dpoints)
    .enter()
        .append("text")
        .attr("x", function(d){ return d.point.x})
        .attr("y", function(d, i){return i % 2 == 0 ? d.point.y-ydistance/2: d.point.y+ydistance}) //-(ydistance/10)
        .attr('text-anchor', 'middle')
        .attr("class", "label")//easy to style with CSS
        .attr("stroke","red")
        .text(function(d){return d.label})

    //meaning points
    if(dpoints[0].meaning){
        g.selectAll("text.meaninglabel")
        .data(dpoints)
        .enter()
            .append("text")
            .attr("x", function(d){ return d.mpoint.x})
            .attr("y", function(d, i){return i % 2 == 0 ? d.mpoint.y-ydistance/2: d.mpoint.y+ydistance}) //-(ydistance/10)
            .attr('text-anchor', 'middle')
            .attr("class", "label")//easy to style with CSS
            .attr("stroke","red")
            .text(function(d){return d.meaning})
    }

     //also draw vertical lines
     g.selectAll("line.vertical")//empty lines
     .data(dpoints)//bind data
     .enter() //create placeholder for every value in data
        .append("line")
        .attr("stroke","gray")
        .style("stroke-width", "0.25")
        .attr("x1", function(d){ return d.point.x})
        .attr("y1", 0)
        .attr("x2", function(d){ return d.point.x})
        .attr("y2", function(d,i){return (alphabet.length+2)*ydistance})
    
       //also draw meaning vertical lines
       //meaning points
    if(dpoints[0].mpoint){
        g.selectAll("line.verticalmeaning")//empty lines
        .data(dpoints)//bind data
        .enter() //create placeholder for every value in data
           .append("line")
           .attr("stroke","gray")
           .style("stroke-width", "0.25")
           .attr("x1", function(d){ return d.mpoint.x})
           .attr("y1", vgraphdistance(labelarray))
           .attr("x2", function(d){ return d.mpoint.x})
           .attr("y2", function(d,i){return vgraphdistance(labelarray)+(alphabet.length+2)*ydistance})
       
    }
     


    //end marking vertical lines
    //to facilitate cropping
    let newxs = getExtraPoints(dpoints,2)
    g.selectAll("line.vertical")//empty lines
    .data(newxs)//bind data
    .enter() //create placeholder for every value in data
        .append("line")
        .attr("stroke","gray")
        .style("stroke-width", "0.25")
        .attr("x1", function(d){ return d})
        .attr("y1", 0)
        .attr("x2", function(d){ return d})
        .attr("y2", function(d,i){return (alphabet.length+2)*ydistance})
        
    
    //end marking vertical lines
    //to facilitate cropping
    if(dpoints[0].mpoint){
        let newxs2 = getExtraPoints(dpoints,2)
        g.selectAll("line.vertical")//empty lines
        .data(newxs)//bind data
        .enter() //create placeholder for every value in data
            .append("line")
            .attr("stroke","gray")
            .style("stroke-width", "0.25")
            .attr("x1", function(d){ return d})
            .attr("y1", 0)
            .attr("x2", function(d){ return d})
            .attr("y2", function(d,i){return vgraphdistance(labelarray)+(alphabet.length+2)*ydistance})
    }
    
    dothistory.push(pointid)
}


function getExtraPoints(dpoints, num = 5){
    let lastpoint = dpoints[dpoints.length-1]
    let lastx = lastpoint.point.x 

    let newxs = []
    for(let i=dpoints.length; i<dpoints.length+num; i++){
        newxs.push(i*xdistance + xdistance + axisleft) //same formula at getDatapointsFromTextData(data)
    }
    return newxs
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
function getDatapointsFromTextData(data,labelarray){

    //let dpoints = []
    
    //assign Point for each letter
    for(let i=0; i<data.length; i++){
        let x = i*xdistance + xdistance + axisleft
        let y = data[i].index * ydistance + ydistance
        data[i].point = new Point(x, y) 
        
        //dpoints.push(data[i].point)

        if(data[i].mindex >= -1){
            let mx = i*xdistance + xdistance + axisleft
            let my = vgraphdistance(labelarray)+data[i].mindex * ydistance + ydistance
            data[i].mpoint = new Point(mx, my) 

        }
        else data[i].mpoint = null
    }
    return data
}

function numericalizerText(text, numberonly = false){
    let words = text.split(" ")
    
    let data = []
    if(numberonly) data = getNumberWords(words)   
    else data = getTextWords(words)

    return data
}
function getTextWords(words){
    let data = []
    for(let i=0; i<words.length; i++){
        let splits = words[i].split(";")
        let word = splits[0]
        let modword = preProcessData(word) //processed version of the word
        let x = 0
        while(x < modword.length){
            let xchar = modword[x]
            if(alphabet.includes(xchar)){
                let xx = {
                    label:word, //keep original word
                    word: modword, //use processed word for calculation
                    letter: xchar,
                    index: alphabet.indexOf(xchar),
                }

                if(splits[1]){
                    let meaning = splits[1]
                    xx.meaning = meaning
                    xx["mletter"] = meaning[0]
                    xx["mindex"] = alphabet.indexOf(meaning[0])
                }
                data.push(xx)
                break
            }
            
            x++
        }
        
    }

    return data
}
function getNumberWords(words){
    let data = []
    for(let i=0; i<words.length; i++){
        let word = words[i]
        //let modword = preProcessData(word) //processed version of the word
        let x = 0
        while(x < word.length){
            let xchar = word[x]
            if(numbers.includes(xchar)){
                data.push({
                    label:word, //keep original word
                    word: word, //it should be same as label
                    letter: xchar,
                    index: numbers.indexOf(xchar)
                })
                break
            }
            
            x++
        }
        
    }

    return data
}

function isAllNumbers(data){
    let x = 0
    while(x < data.length){
        let xchar = data[x]
        if(alphabet.includes(xchar)) return false
        x++
    }
    return true
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

    //d3.select("g").selectAll("*").remove()
    d3.select("svg").selectAll("*").remove()
}

