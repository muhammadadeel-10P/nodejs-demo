function getHello(req, res) {
  res.status(200).json({ message: 'Hello, world!' });
}

module.exports = { getHello };
