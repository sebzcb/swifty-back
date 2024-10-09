const { CLAVES } = require("./claves");

const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const getClave = (horainicial, horafinal) => {
    const inicioMin = timeToMinutes(horainicial);
    const finMin = timeToMinutes(horafinal);

    const clavesOcupadas = [];

    for (const clave in CLAVES) {
        if (CLAVES.hasOwnProperty(clave)) {
            const horario = CLAVES[clave];
            const inicioClaveMin = timeToMinutes(horario.inicio);
            const finClaveMin = timeToMinutes(horario.fin);

            // Verificar si hay solapamiento
            if (inicioMin < finClaveMin && finMin > inicioClaveMin) {
                clavesOcupadas.push(clave);
            }
        }
    }

    return clavesOcupadas;
};

module.exports = { getClave };
