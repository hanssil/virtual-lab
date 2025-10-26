module.exports = (req, res) => {
  res.status(200).json({
    ok: true,
    service: 'virtual-lab-api',
    storage: 'firestore',
    time: new Date().toISOString(),
  });
};
