/**
 * "Custom Component Library" since we had to use pure js for this project
 */

export const createDiv = (cn) => {
    let div = document.createElement('div');
    div.className = cn;
    return div;
};

export const createInput = ({ parentClassName='', label='', callback=()=>{} }) => {
    let div = document.createElement('div');
    div.className = parentClassName;

    let p = document.createElement('p');
    p.className = 'input-label';
    p.innerHTML = label;

    let input = document.createElement('input');
    input.addEventListener('input', callback);

    div.appendChild(p);
    div.appendChild(input);

    return div;
};