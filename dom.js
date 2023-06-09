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

    input.type = "number";
    div.appendChild(p);
    div.appendChild(input);

    return div;
};

export const createButton = ({ className='', label='', callback=()=>{} }) => {
    let button = document.createElement('button');
    button.innerHTML = label;
    button.className = className;
    button.addEventListener('mousedown', () => callback());

    return button;
};

export const createFileInput = ({ className='', label='', callback=()=>{} }) => {
    let input = document.createElement('input');
    let button = document.createElement('button');

    input.type = 'file';
    input.addEventListener('change', callback);

    input.id = 'file-input';
    input.style = 'display: none';

    button.innerHTML = label;
    button.className = className;
    button.addEventListener('mousedown', () => input.click());

    button.appendChild(input);
    return button;
};

export const createCheckbox = ({ className='', label='', callback=()=>{} }) => {
    let input = document.createElement('input');
    input.type = 'checkbox';
    input.onchange = callback;

    input.innerHTML = label;
    input.className = className;

    return input;
};