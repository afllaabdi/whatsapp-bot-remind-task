const { saveTugas, getTugas, updateTugas } = require('../utils/storage');
const moment = require('moment');

async function handleCommand(client, msg) {
    const body = msg.body;
    const lowerBody = body.toLowerCase();
    const chatId = msg.from;

    // --- MENU UTAMA & HAI GANTENG ---
    if (lowerBody === 'hai ganteng' || lowerBody === '/menu' || lowerBody === '/help' || lowerBody === '/start') {
        const menu = `
*🎓 ASISTEN TUGAS KULIAH 🎓*

Halo Ganteng! 😎 Ada yang bisa dibantu?

📌 *PERINTAH UTAMA*
1️⃣ */tambah* - Tambah tugas baru
2️⃣ */list* - Lihat tugas pending
3️⃣ */selesai* - Tandai tugas beres

📝 *FORMAT TAMBAH (PAKAI KOMA)*
*/tambah [Matkul], [Tugas], [Tenggat]*
_Contoh:_
/tambah Data Science, Cleaning Data, 2026-05-10 23:59

✅ *CARA MENYELESAIKAN*
Ketik: */selesai [Nomor Urut]*
Contoh: /selesai 1

---
_Bot akan otomatis mengingatkanmu pada H-1 dan 1 Jam sebelum deadline._
        `.trim();
        return msg.reply(menu);
    }

    // --- FITUR: TAMBAH TUGAS (DENGAN NOTIF TETAP SEMANGAT) ---
    if (lowerBody.startsWith('/tambah')) {
        const content = body.substring(body.indexOf(' ') + 1);
        const parts = content.split(',');
        
        if (parts.length < 3) {
            return msg.reply('❌ Format salah, Ganteng! \nGunakan koma: */tambah Matkul, Detail Tugas, YYYY-MM-DD HH:mm*');
        }

        const [matkul, detail, deadline] = parts.map(p => p.trim());

        // Validasi Format Waktu
        if (!moment(deadline, 'YYYY-MM-DD HH:mm', true).isValid()) {
            return msg.reply('⚠️ Format tanggal salah! Gunakan YYYY-MM-DD HH:mm\nContoh: 2026-05-20 23:59');
        }

        saveTugas({ 
            id: Date.now(), 
            chatId, 
            matkul, 
            detail, 
            deadline, 
            status: 'pending',
            createdAt: moment().format('YYYY-MM-DD HH:mm')
        });

        // Respon konfirmasi tugas berhasil ditambahkan
        return msg.reply(`✅ *Tugas berhasil di tambahkan tetap semangat!*\n\n📚 Matkul: ${matkul}\n📝 Tugas: ${detail}\n⏰ Deadline: ${deadline}\n\n🔥 *Tugasmu bertambah bos, keep going!*`);
    }

    // --- FITUR: DAFTAR TUGAS ---
    if (lowerBody === '/list') {
        const allTugas = getTugas();
        const pendingList = allTugas.filter(t => t.status === 'pending');

        if (pendingList.length === 0) {
            return msg.reply('🎉 *Hore!* Tidak ada tugas yang tertunda. Kamu bebas sekarang, Ganteng!');
        }

        let respons = '📋 *DAFTAR TUGAS PENDING*:\n\n';
        pendingList.forEach((t, i) => {
            respons += `*${i + 1}. ${t.matkul}*\n`;
            respons += `└ 📝 ${t.detail}\n`;
            respons += `└ ⏰ DL: ${t.deadline}\n\n`;
        });
        
        respons += '_Ketik "/selesai [nomor]" jika sudah beres._';
        return msg.reply(respons);
    }

    // --- FITUR: SELESAI TUGAS + MOTIVASI ---
    if (lowerBody.startsWith('/selesai')) {
        const args = body.split(' ');
        if (args.length < 2) return msg.reply('⚠️ Masukkan nomor tugas! Contoh: /selesai 1');

        const num = parseInt(args[1]) - 1;
        const allTugas = getTugas();
        const pendingTugas = allTugas.filter(t => t.status === 'pending');

        if (pendingTugas[num]) {
            const targetId = pendingTugas[num].id;
            
            const updatedAllTugas = allTugas.map(t => {
                if (t.id === targetId) return { ...t, status: 'selesai' };
                return t;
            });
            updateTugas(updatedAllTugas);

            const sisaTugas = pendingTugas.length - 1;
            let pesanRespon = `✅ Mantap! Tugas *${pendingTugas[num].matkul}* sudah kelar.`;
            
            if (sisaTugas > 3) {
                pesanRespon += `\n\n🔥 *Semangat terus bos, tugas masih banyak!* (Sisa: ${sisaTugas} tugas)`;
            } else if (sisaTugas > 0) {
                pesanRespon += `\n\n💪 Sedikit lagi beres, sisa ${sisaTugas} tugas lagi! Ayo gas!`;
            } else {
                pesanRespon += `\n\n🎉 *MERDEKA!* Semua tugas sudah selesai dikerjakan!`;
            }

            return msg.reply(pesanRespon);
        } else {
            return msg.reply('❌ Nomor tugas tidak valid.');
        }
    }
}

module.exports = { handleCommand };