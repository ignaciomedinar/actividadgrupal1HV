// Selectores (elementos en el HTML)
const graf = d3.select("#graf")
const metrica = d3.select("#metrica")

// Dimensiones
const margins = {
  top: 50,
  right: 20,
  bottom: 130,
  left: 105,
}
const anchoTotal = +graf.style("width").slice(0, -2)
const altoTotal = (anchoTotal * 9) / 16

const ancho = anchoTotal - margins.right - margins.left
const alto = altoTotal - margins.top - margins.bottom

// Areas de dibujo
const svg = graf
  .append("svg")
  .attr("width", anchoTotal)
  .attr("height", altoTotal)
  .attr("class", "graf")

svg
  .append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", ancho)
  .attr("height", alto)
  .attr("transform", `translate(${margins.left}, ${margins.top})`)
  .classed("backdrop", true)
  

const g = svg
  .append("g")
  .attr("transform", `translate(${margins.left}, ${margins.top})`)
  

const draw = async (m = "2007") => {
  let data = await d3.csv("Exp_estado.csv", d3.autoType)
  // let data = await d3.csv("Exp_anio.csv", d3.autoType)
  // Llenar el select
  // console.log(data)
  // console.log(Object.keys(data[0]).slice(0,15))
  metrica
    .selectAll("option")
    .data(Object.keys(data[0]).slice(0,15))
    .enter()
    .append("option")
    .attr("value", (d) => d)
    .text((d) => d)

  // Accessor
  const xAccessor = (d) => d.Estado
  // const xAccessor = (d) => d.Year

  // Escaladores
  const x = d3.scaleBand().range([0, ancho]).paddingOuter(0.2).paddingInner(0.1)
  const y = d3.scaleLinear().range([alto, 0])
  const color = d3
    .scaleOrdinal()
    .domain(Object.keys(data[0]).slice(1))
    .range(d3.schemePaired)

  // Titulo
  const titulo = g
    .append("text")
    .attr("x", ancho / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .classed("titulo", true)
    

  // Ejes
  const xAxisGroup = g
    .append("g")
    .attr("transform", `translate(0, ${alto})`)
    .classed("axis", true)
    
    
    
  const yAxisGroup = g.append("g").classed("axis", true)

  const render = (m) => {
    // Accesores
    const yAccessor = (d) => d[m]

    // Ordenamiento de datos
    data.sort((a, b) => b[m] - a[m])

    // Escaladores
    const Estados = d3.map(data, (d) => d.Estado)
    x.domain(Estados)
    y.domain([0, d3.max(data, yAccessor)])

    // Dibujo de las barras
    const rect = g.selectAll("rect").data(data)
    rect
      .enter()
      .append("rect")
      
      .attr("x", (d) => x(xAccessor(d)))
      .attr("y", y(0))
      .attr("width", x.bandwidth())
      
      .attr("height", 0)
      .attr("fill", "white")
      
      //Tooltip
      .append('title')
      .text((d) => `Exportaciones en el Estado de ${d.Estado}`)

      .merge(rect)
      
      .transition()
      .duration(2500)
      
      

      .attr("x", (d) => x(xAccessor(d)))
      .attr("y", (d) => y(yAccessor(d)))
      
      .attr("width", x.bandwidth())
      .attr("height", (d) => alto - y(yAccessor(d)))
      .attr("fill", color(m))
      

    // Título
    titulo.text("Exportaciones en USD por estado en " + m)

    // Ejes
    const xAxis = d3.axisBottom(x)
    const yAxis = d3.axisLeft(y).ticks(15)
    xAxisGroup.transition().duration(2500).call(xAxis).selectAll("text")
    .attr("y", 0)
    .attr("x", 9)
    .attr("dy", ".35em")
    .attr("transform", "rotate(90)")
    .style("text-anchor", "start")
    yAxisGroup.transition().duration(2500).call(yAxis)
    
  }
  
  // Escucha de Eventos
  metrica.on("change", (e) => {
    e.preventDefault()
    console.log(metrica.node().value)
    render(metrica.node().value)
  })

  render(m)
}

draw()
