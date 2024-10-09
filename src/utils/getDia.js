const { DAYS } = require('./Days');

const getDay = (fecha) => {
    const date = new Date(fecha);
    console.log(date);
    // Ajusta la fecha a la zona horaria local
    const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    console.log(localDate);
    const dayNumber = localDate.getDay();
    console.log(dayNumber);
    const dayNames = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    const dayName = dayNames[dayNumber];
    console.log(dayName);
    const dayResult = DAYS[dayName];
    console.log(dayResult);
    return dayResult;
};

module.exports = { getDay };
