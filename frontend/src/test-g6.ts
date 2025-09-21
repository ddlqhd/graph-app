import * as G6 from '@antv/g6'

console.log('G6 version:', G6.version || 'unknown')
console.log('G6 object keys:', Object.keys(G6))
console.log('G6.Graph:', G6.Graph)
console.log('typeof G6.Graph:', typeof G6.Graph)

if (typeof G6.Graph === 'function') {
    // 创建一个测试实例
    const testContainer = document.createElement('div')
    testContainer.style.width = '100px'
    testContainer.style.height = '100px'
    document.body.appendChild(testContainer)

    try {
        const graph = new G6.Graph({
            container: testContainer,
            width: 100,
            height: 100
        })

        console.log('Graph instance created successfully')
        console.log('Available methods:')
        console.log('- data:', typeof graph.data)
        console.log('- read:', typeof graph.read)
        console.log('- render:', typeof graph.render)
        console.log('- changeData:', typeof graph.changeData)

        // 列出原型上的所有方法
        const proto = Object.getPrototypeOf(graph)
        const methods = Object.getOwnPropertyNames(proto).filter(name =>
            typeof (graph as any)[name] === 'function' && !name.startsWith('_')
        )
        console.log('All public methods:', methods)

        document.body.removeChild(testContainer)
        graph.destroy()

    } catch (error) {
        console.error('Failed to create graph:', error)
        document.body.removeChild(testContainer)
    }
} else {
    console.error('G6.Graph is not a constructor')
}

export default G6