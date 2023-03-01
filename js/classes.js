class Point{
    constructor(x, y){
        this.x = x
        this.y = y
    }
}

class Line{
    constructor(startpoint, endpoint, svg, color="gray"){
        this.startpoint = startpoint
        this.endpoint = endpoint
        this.svg = svg
        this.color = color
        this.id = "id" + Math.random().toString(16).slice(2)
    }

    drawLine(){
        this.svg.append("line")
            .style("stroke", this.color)
            .style("stroke-width",1)
            .attr("x1", this.startpoint.x)
            .attr("y1", this.startpoint.y)
            .attr("x2", this.endpoint.x)
            .attr("y2", this.endpoint.y)
            .attr("id", this.id)
    }
}

class Circle{
    constructor(centerpoint, radius, svg, color="gray", fillcolor="fff"){
        this.centerpoint = centerpoint
        this.radius = radius
        this.svg = svg
        this.color = color
        this.fillcolor = fillcolor
        this.id = "id" + Math.random().toString(16).slice(2)
    }

    drawCircle(){
        this.svg.append('circle')
            .attr('cx', this.centerpoint.x)
            .attr('cy', this.centerpoint.y)
            .attr('r', this.radius)
            .attr('stroke', this.color)
            .attr('fill', this.fillcolor)
            .attr("id", this.id)
    }
}