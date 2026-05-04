const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { handleCommand } = require('./commands/handler');
const { startReminderSystem } = require('./utils/reminder');

/**
 * Inisialisasi Client WhatsApp
 * Menggunakan LocalAuth agar sesi login tersimpan di folder ./sessions
 */
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './sessions' 
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ],
        // Pastikan path ini benar sesuai lokasi Chrome di laptop kamu
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    }
});

// Event: Menampilkan QR Code di Terminal
client.on('qr', (qr) => {
    console.log('---------------------------------------------------------');
    console.log('SILAKAN SCAN QR CODE DI BAWAH INI:');
    qrcode.generate(qr, { small: true });
    console.log('---------------------------------------------------------');
});

// Event: Bot Berhasil Terhubung
client.on('ready', () => {
    console.log('---------------------------------------------------------');
    console.log('STATUS: Bot WhatsApp Pengingat Tugas SUDAH AKTIF!');
    console.log('LOG   : Menjalankan sistem pengingat otomatis...');
    console.log('---------------------------------------------------------');
    
    try {
        startReminderSystem(client);
    } catch (error) {
        console.error('Gagal menjalankan sistem reminder:', error);
    }
});

// --- BAGIAN YANG DIPERBAIKI ---
client.on('message', async (msg) => {
    const pesanMasuk = msg.body.toLowerCase(); // Mengubah pesan ke huruf kecil semua

    // Cek apakah pesan diawali '/' ATAU sama dengan 'hai ganteng'
    if (pesanMasuk.startsWith('/') || pesanMasuk === 'hai ganteng') {
        try {
            await handleCommand(client, msg);
        } catch (error) {
            console.error('Terjadi kesalahan saat memproses perintah:', error);
            msg.reply('❌ Maaf, terjadi kesalahan saat memproses perintah tersebut.');
        }
    }
});

// Event: Menangani jika koneksi terputus
client.on('disconnected', (reason) => {
    console.log('Koneksi terputus:', reason);
});

console.log('Sedang memulai bot, harap tunggu...');
client.initialize();