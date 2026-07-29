const fs = require('fs');
const file = 'src/app/registro/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /type TipoContraparte = 'persona_natural' \| 'persona_juridica' \| 'empleado' \| 'extranjero' \| ''/,
  `type TipoContraparte = 'persona_natural' | 'persona_juridica' | 'empleado' | 'extranjero' | 'contado' | ''`
);

content = content.replace(
  /if \(tipo === 'empleado'\)/,
  `if (tipo === 'empleado' || tipo === 'contado')`
);

content = content.replace(
  /setTipoContraparte\('empleado'\)/,
  `setTipoContraparte(tipo as TipoContraparte)`
);

content = content.replace(
  /tipoContraparte === 'empleado'/g,
  `(tipoContraparte === 'empleado' || tipoContraparte === 'contado')`
);

content = content.replace(
  /tipoContraparte !== 'empleado'/g,
  `(tipoContraparte !== 'empleado' && tipoContraparte !== 'contado')`
);

fs.writeFileSync(file, content);
console.log("Done");
