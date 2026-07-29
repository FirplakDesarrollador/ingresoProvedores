const fs = require('fs');
const file = 'src/app/registro/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /\{tipoContraparte === 'empleado' && \(/g,
    `{(tipoContraparte === 'empleado' || tipoContraparte === 'contado') && (`
);

content = content.replace(
    /\{tipoContraparte === 'empleado' \? \(/g,
    `{(tipoContraparte === 'empleado' || tipoContraparte === 'contado') ? (`
);

fs.writeFileSync(file, content);
console.log('Done');
