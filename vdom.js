import {
    filterChildNodes,
    isEmptyTextNode,
    updateAttrs,
} from './dom';

import {
    zip,
} from './util';

function dom2vdom(dom) {
    if (dom.nodeType === Node.TEXT_NODE) {
        return dom.textContent.trim();
    } else {
        const vdom = Object.create(null);
        vdom.tagName = dom.tagName.toLowerCase();
        vdom.attrs = {};
        vdom.children = [];
        dom.getAttributeNames()
            .forEach(attrName => {
                vdom.attrs[attrName] = dom.getAttribute(attrName); // "" if it's a key-only attribute
            });
        filterChildNodes(dom, n => !isEmptyTextNode(n))
            .forEach(domChild => {
                const vdomChild = dom2vdom(domChild);
                vdom.children.push(vdomChild);
            });
        return vdom;
    }
}
function vdom2dom(vdom) {
    if (typeof vdom === 'string') {
        return document.createTextNode(vdom);
    } else {
        const domUnattached = document.createElement(vdom.tagName);
        updateAttrs(domUnattached, vdom.attrs);
        vdom.children
            .forEach(vdomChild => {
                const childDomNode = vdom2dom(vdomChild);
                domUnattached.appendChild(childDomNode);
            });
        return domUnattached;
    }
}
// vdom's attributions: all are modifier; use false to remove attribute
// vdom's children: need to compare with target to decide whether to add, remove or replace
export function generateVdomNode(tagName, attrs, ...children) {
    const vdom = Object.create(null);
    vdom.tagName = tagName;
    vdom.attrs = attrs || {};
    vdom.children = children || [];
    return vdom;
}
export function patchSync(domOld, vdomNew) {
    const vdomOld = dom2vdom(domOld);
    const typeOld = typeof vdomOld;
    const typeNew = typeof vdomNew;
    if (typeNew === 'undefined') {
        domOld.remove();
    } else if (typeOld === 'string' && typeNew === 'string') {
        if (vdomOld === vdomNew) {
            return;
        }
        domOld.replaceWith(vdom2dom(vdomNew));
    } else if (typeOld === 'string' || typeNew === 'string') {
        // "shape" changed
        domOld.replaceWith(vdom2dom(vdomNew));
    } else if (vdomOld.tagName !== vdomNew.tagName) {
        // "shape" changed
        domOld.replaceWith(vdom2dom(vdomNew));
    } else {
        // patch deeper
        updateAttrs(domOld, vdomNew.attrs);

        const domChildrenOld = filterChildNodes(domOld, n => !isEmptyTextNode(n));
        const vdomChildrenNew = vdomNew.children;

        for (let [domChildOld, vdomChildNew] of zip(domChildrenOld, vdomChildrenNew)) {
            if (domChildOld && vdomChildNew) {
                patchSync(domChildOld, vdomChildNew);
            } else if (vdomChildNew) {
                // patch adds new nodes
                domOld.appendChild(vdom2dom(vdomChildNew));
            } else {
                // patch removes nodes
                domChildOld.remove();
            }
        }
    }
}