const fs = require('fs');

try {
    // Đọc file CSV
    const data = fs.readFileSync('don_vi_hanh_chinh_cap_xa (1).csv', 'utf8');
    const lines = data.split('\n');
    
    let provinces = {}; 
    let provinceCounter = 1;
    let wards = [];
    
    // Regex tìm kiếm: Bỏ qua Stt, lấy Mã số (5 chữ số), Tên Phường, Tên Tỉnh
    const regex = /^\s*(?:\d+)?\s*(\d{5})\s+(.*?)\s+(Thành phố .+|Tỉnh .+|Tp .+)$/i;

    lines.forEach(line => {
        line = line.replace(/"/g, '').trim(); 
        const match = line.match(regex);
        
        if (match) {
            const wardCode = match[1];
            // Fix lỗi SQL Syntax: Replace single quotes with double single quotes
            const wardName = match[2].trim().replace(/'/g, "''");
            const provinceName = match[3].trim().replace(/'/g, "''");
            
            if (!provinces[provinceName]) {
                const pCode = 'P' + provinceCounter.toString().padStart(2, '0');
                provinces[provinceName] = pCode;
                provinceCounter++;
            }
            
            wards.push({ code: wardCode, name: wardName, provName: provinceName });
        }
    });

    let sql = `-- V8__Create_Location_Tables.sql\n\n`;
    
    // 1. Tạo bảng
    sql += `CREATE TABLE IF NOT EXISTS provinces (\n    code VARCHAR(20) PRIMARY KEY,\n    name VARCHAR(100) NOT NULL\n);\n\n`;
    sql += `CREATE TABLE IF NOT EXISTS districts (\n    code VARCHAR(20) PRIMARY KEY,\n    name VARCHAR(100) NOT NULL,\n    province_code VARCHAR(20),\n    FOREIGN KEY (province_code) REFERENCES provinces(code)\n);\n\n`;
    sql += `CREATE TABLE IF NOT EXISTS wards (\n    code VARCHAR(20) PRIMARY KEY,\n    name VARCHAR(100) NOT NULL,\n    district_code VARCHAR(20),\n    FOREIGN KEY (district_code) REFERENCES districts(code)\n);\n\n`;

    // 2. Chèn dữ liệu Tỉnh/Thành
    sql += `INSERT INTO provinces (code, name) VALUES\n`;
    const provEntries = Object.entries(provinces);
    const provValues = provEntries.map(([name, code]) => `('${code}', '${name}')`).join(',\n');
    sql += provValues + `;\n\n`;

    // 3. Chèn dữ liệu Quận/Huyện (Tự sinh)
    sql += `INSERT INTO districts (code, name, province_code) VALUES\n`;
    const distValues = provEntries.map(([name, code]) => `('D_${code}', 'Quận/Huyện thuộc ${name}', '${code}')`).join(',\n');
    sql += distValues + `;\n\n`;

    // 4. Chèn dữ liệu Phường/Xã
    sql += `INSERT INTO wards (code, name, district_code) VALUES\n`;
    const wardValues = wards.map(w => `('${w.code}', '${w.name}', 'D_${provinces[w.provName]}')`).join(',\n');
    sql += wardValues + `;\n`;

    fs.writeFileSync('V8__Create_Location_Tables.sql', sql);
    console.log('✅ Hoàn tất! Hãy copy file V8__Create_Location_Tables.sql vào thư mục db/migration của Spring Boot.');

} catch (err) {
    console.error('❌ Lỗi:', err.message);
}