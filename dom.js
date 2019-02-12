export function filterChildNodes(dom, predicate) {
    return [].slice.call(dom.childNodes || []).filter(predicate);
}
export function isEmptyTextNode(dom) {
    return dom.nodeType === Node.TEXT_NODE && dom.textContent.trim() === '';
}
export function updateAttrs(dom, attrs) {
    for (let [k, v] of Object.entries(attrs || {})) {
        if (v === false) {
            dom.removeAttribute(k);
        } else {
            dom.setAttribute(k, '' + v);
        }
    }
}
