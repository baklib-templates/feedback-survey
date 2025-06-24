import Tom from 'tom-select/dist/js/tom-select.complete.min'

export default (el, { expression}, {evaluateLater, effect}) => {
    const getContent = evaluateLater(expression || '{}')

    effect(() => {
        getContent(content => {
            if (typeof content == 'object')
                el.__x_tom = new Tom(el, content)
            else console.warn('Input mask config should be object')
        })
    })
}
