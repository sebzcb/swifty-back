const { CLAVES } = require("./claves");

const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};
//obtener claves a ocupar en base a la hora de inicio y final
const getClave = (horainicial, horafinal) => {
    console.log("horainicial:", horainicial);
    console.log("horafinal:", horafinal);
    const inicioMin = timeToMinutes(horainicial);
    const finMin = timeToMinutes(horafinal);
    console.log("inicioMin:", inicioMin);
    console.log("finMin:", finMin);

    const clavesOcupadas = [];

    for (const clave in CLAVES) {
        if (CLAVES.hasOwnProperty(clave)) {
            const horario = CLAVES[clave];
            const inicioClaveMin = timeToMinutes(horario.inicio);
            const finClaveMin = timeToMinutes(horario.fin);
            console.log("inicioClaveMin:", inicioClaveMin);
            console.log("finClaveMin:", finClaveMin);
            // Verificar si hay solapamiento
            if (inicioMin < finClaveMin && finMin > inicioClaveMin) {
                clavesOcupadas.push(clave);
            }
        }
    }

    return clavesOcupadas;
};

module.exports = { getClave };
