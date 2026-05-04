// Contoh potongan logika
const input = msg.body.split('|');
const matkul = input[0].replace('/tambah', '').trim();
const detail = input[1].trim();
const deadline = input[2].trim(); // Format: 2026-05-10 23:59

// Simpan ke tugas.json
saveTugas({ matkul, detail, deadline, status: 'pending' });
msg.reply(`✅ Tugas ${matkul} berhasil dicatat!`);