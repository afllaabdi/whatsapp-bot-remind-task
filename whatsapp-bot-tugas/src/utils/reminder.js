const cron = require('node-cron');
const moment = require('moment');
const { getTugas } = require('./storage');

function startReminderSystem(client) {
    // Berjalan setiap menit untuk mengecek deadline
    cron.schedule('* * * * *', () => {
        const listTugas = getTugas();
        const now = moment();

        listTugas.forEach((t) => {
            // Abaikan jika tugas sudah ditandai selesai
            if (t.status === 'selesai') return;

            const dl = moment(t.deadline, 'YYYY-MM-DD HH:mm');
            const diffMinutes = dl.diff(now, 'minutes');
            const diffHours = dl.diff(now, 'hours');

            // --- 1. PENGINGAT RUTIN (TIAP 8 JAM) ---
            // Mengirim pengingat jika sisa waktu adalah kelipatan 8 jam (misal: 24, 16, 8 jam)
            // moment().format('mm') === '00' memastikan hanya dikirim sekali tepat di menit ke-0
            if (diffHours > 0 && diffHours % 8 === 0 && moment().format('mm') === '00') {
                client.sendMessage(t.chatId, `📢 *PENGINGAT RUTIN (SISA ${diffHours} JAM)*\n\n📚 *${t.matkul}*\n📝 ${t.detail}\n\nCicil pelan-pelan yuk bos, biar ga numpuk! 🔥`);
            }

            // --- 2. PENGINGAT H-1 (1440 MENIT) ---
            if (diffMinutes === 1440) {
                client.sendMessage(t.chatId, `⚠️ *PENGINGAT H-1*\n\n📚 *${t.matkul}*\n📝 ${t.detail}\n⏰ Deadline: ${t.deadline}\n\nBesok sudah harus dikumpul lho, semangat!`);
            }

            // --- 3. PENGINGAT DEADLINE KRITIS (1 JAM / 60 MENIT) ---
            if (diffMinutes === 60) {
                client.sendMessage(t.chatId, `🚨 *DEADLINE KRITIS (1 JAM LAGI)*\n\n📚 *${t.matkul}*\n\nWaktu hampir habis! Segera selesaikan dan kumpulkan tugasmu sekarang! 🏃‍♂️💨`);
            }
        });
    });
}

module.exports = { startReminderSystem };