const fs = require('fs');
const path = './data/tugas.json';

// Pastikan folder data ada
if (!fs.existsSync('./data')) fs.mkdirSync('./data');

const getTugas = () => {
    if (!fs.existsSync(path)) return [];
    return JSON.parse(fs.readFileSync(path, 'utf-8'));
};

const saveTugas = (data) => {
    const list = getTugas();
    list.push(data);
    fs.writeFileSync(path, JSON.stringify(list, null, 2));
};

const updateTugas = (newList) => {
    fs.writeFileSync(path, JSON.stringify(newList, null, 2));
};

module.exports = { getTugas, saveTugas, updateTugas };