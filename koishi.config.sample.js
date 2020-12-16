module.exports = {
  plugins: [
    ['common'],
    ['tools'],
    './plugins/acker.ts',
    './plugins/caker.js',
  ],
  type: "http://localhost:5700",
  port: 8080,
  selfId: 123456789,
  server: 'http://localhost:5700',
  token: '1234567890',
}
