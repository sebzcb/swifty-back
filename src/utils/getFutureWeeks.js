const { getWeekNumber } = require("./getWeekNumber");

const getFutureWeeks = (startDate, numberOfWeeks) => {
    console.log('Fecha de inicio:', startDate);
    console.log('Número de semanas a generar:', numberOfWeeks);

    const weeks = [];
    let date = new Date(startDate);
    let week = getWeekNumber(date);
    let year = date.getFullYear();

    for (let i = 0; i < numberOfWeeks; i++) {
        weeks.push({ week, year });
        week++;
        if (week > 52) { // Asumiendo que hay 52 semanas en un año
            week = 1;
            year++;
        }
    }
    return weeks;
};

module.exports = { getFutureWeeks };