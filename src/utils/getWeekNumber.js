const getWeekNumber = (date) => {
    console.log('Fecha getWeekNumber:', date);
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = (date - start + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60000));
    const oneWeek = 604800000; // Milisegundos en una semana
    return Math.floor(diff / oneWeek) + 1;
};

module.exports = { getWeekNumber };