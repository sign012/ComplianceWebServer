/**
 * 简单的加解密
 * */

const crypto = require('crypto');


const AES_conf = {
    key: 'upchinaboomli888', //16位密钥
    iv: 'tea114upchina666', //偏移向量
}


let cryptoCtl = {
    /**
     * AES_128_CBC 加密
     * 128位
     * return base64
     */
    encryption: function (data) {
        let key = AES_conf.key,
            iv = AES_conf.iv,
            cipherChunks = [];

        let cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
        cipher.setAutoPadding(true);
        cipherChunks.push(cipher.update(data, 'utf8', 'base64'));
        cipherChunks.push(cipher.final('base64'));
        return cipherChunks.join('');
    },

    /**
     * 解密
     * return utf8
     */
    decryption: function (data) {
        let key = AES_conf.key,
            iv = AES_conf.iv,
            cipherChunks = [];
        let decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
        decipher.setAutoPadding(true);
        cipherChunks.push(decipher.update(data, 'base64', 'utf8'));
        cipherChunks.push(decipher.final('utf8'));
        return cipherChunks.join('');
    },

    /**
     * 密码加密（加盐）
     * @param pwd 原始密码
     * @param salt 加盐值
     * @return 两次md5值
     */
    pwdMD5: function (pwd,salt) {
        const hash1 = crypto.createHash('md5');
        let password_salt = hash1.update(pwd);
        let password_hex = password_salt.digest('hex');
        const hash2 = crypto.createHash('md5');
        password_salt = hash2.update(password_hex + salt);
        password_hex = password_salt.digest('hex');

        return password_hex;
    },

    /**
     * 1次密码加密（加盐）
     * @param password_hex  1次MD5值
     * @param salt 加盐值
     * @return 两次md5值
     */
    onePwdMD5Salt: function (password_hex,salt) {
        const hash2 = crypto.createHash('md5');
        password_salt = hash2.update(password_hex + salt);
        password_hex = password_salt.digest('hex');

        return password_hex;
    }

};


module.exports = cryptoCtl;
